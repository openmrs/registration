function AppDescriptor(context, inheritContext, retrieveUserCallback) {
    this.id = null;
    this.instanceOf = null;
    this.description = null;
    this.contextModel = null;

    this.extensionPoints = [];
    this.extensions = [];
    this.configs = [];

    this.extensionPath = context;
    this.contextPath = inheritContext ? context.split("/")[0] : context;

    var that = this;

    this.setExtensions = function(extensions) {
        extensions.forEach(function(extn) {
            var existing = that.extensionPoints.filter(function(ep) {
                return ep.id == extn.extensionPointId;
            });

            if (existing.length == 0) {
                that.extensionPoints.push({
                    id: extn.extensionPointId,
                    description: extn.description
                });
            }
        });
        that.extensions = extensions;
    };

    this.setTemplate = function(template) {
        that.instanceOf = template.id;
        that.description = that.description || template.description;
        that.contextModel = that.contextModel || template.contextModel;
        if (template.configOptions) {
            template.configOptions.forEach(function(opt) {
                var existing = that.configs.filter(function(cfg) {
                    return cfg.name == opt.name;
                });
                if (existing.length > 0) {
                    existing[0].description = opt.description;
                } else {
                    that.configs.push({
                        name: opt.name,
                        description: opt.description,
                        value: opt.defaultValue
                    });
                }
            });
        }
    };

    this.setDefinition = function(instance) {
        that.instanceOf = instance.instanceOf;
        that.id = instance.id;
        that.description = instance.description;
        if (instance.extensionPoints) {
            instance.extensionPoints.forEach(function(iep) {
                var existing = that.extensionPoints.filter(function(ep) {
                    return ep.id == iep.id;
                });
                if (existing.length === 0) {
                    that.extensionPoints.push(iep);
                }
            });
        }

        if (instance.config) {
            for (var configName in instance.config) {
                var existingConfig = that.getConfig(configName);
                if (existingConfig) {
                    existingConfig.value = instance.config[configName];
                } else {
                    that.configs.push({ name: configName, value: instance.config[configName] });
                }
            }
        }
    };

    var getUniqueById = function(extensions) {
        var uniqueExtensions = {};
        return extensions.filter(function(ext) {
            if(uniqueExtensions[ext.id] == null) {
                uniqueExtensions[ext.id] = ext;
                return true;
            }
        })
    };

    this.getExtensions = function (extPointId, type) {
        var currentUser = retrieveUserCallback();
        if (currentUser && that.extensions) {
            var extnType = type || 'all';
            var userPrivileges = currentUser.privileges.map(function (priv) {
                return priv.retired ? "" : priv.name;
            });
            var appsExtns = that.extensions.filter(function (extn) {
                return ((extnType==='all') || (extn.type===extnType)) && (extn.extensionPointId === extPointId) && (!extn.requiredPrivilege || (userPrivileges.indexOf(extn.requiredPrivilege) >= 0));
            });
            appsExtns.sort(function(extn1, extn2) {
                return extn1.order - extn2.order;
            });

            return getUniqueById(appsExtns);
        }
    };

    this.getConfig = function(configName) {
        return that.configs.filter(function(cfg) {
            return cfg.name == configName;
        })[0];
    };

    this.getConfigValue = function(configName, defaultValue) {
        var config = that.getConfig(configName);
        return config ? (config.value || defaultValue) : defaultValue;
    };

    this.formatUrl =  function (url, options) {
        var pattern = /{{([^}]*)}}/g;
        var matches = url.match(pattern);
        var replacedString = url;
        if (matches) {
            matches.forEach(function(el) {
                var key = el.replace("{{",'').replace("}}",'');
                var value = options[key];
                if (value) {
                    replacedString = replacedString.replace(el, options[key]);
                }
            });
        }
        return replacedString.trim();
    };
}
