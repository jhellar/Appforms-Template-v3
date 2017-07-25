FormModel = Backbone.Model.extend({
    idAttribute: 'Hash',
    sync: function(method, model, options) {
        if (method == "read") {
            this.loadForm();
        }
    },
    defaults: {
        "Theme": "",
        "Pages": [],
        "Rules": [],
        "active_page": null,
        "page_history": []
    },
    unsafeFormFields: [
        "name",
        "helpText",
        "fieldCode"
    ],
    // Escape form fields to prevent XSS attacks
    sanitizeForm: function(form) {
        var self = this;

        if (!form.fields || form.fields.length === 0) {
            return;
        }

        // Sanitize radio, dropdown and checkbox fields
        function sanitizeMultipleChoice(field) {
            var props = field.props;
            if (props && props.fieldOptions && props.fieldOptions.definition) {
                var definition = props.fieldOptions.definition;
                if (definition.options) {
                    for (var i = 0; i < definition.options.length; i++) {
                        definition.options[i].label = _.escape(definition.options[i].label);
                    }
                }
            }
        }

        // Sanitize default fields (text, number, etc.)
        function sanitizeDefault(field) {
            self.unsafeFormFields.forEach(function (prop) {
                field.props[prop] = _.escape(field.props[prop]);
            });
        }

        function sanitizeField(field) {
            if (field.props) {
                if (["radio", "dropdown", "checkboxes"].indexOf(field.props.type) >= 0) {
                    // Multiple choice fields need special treatment
                    sanitizeMultipleChoice(field);
                }
                sanitizeDefault(field);
            }
        }

        for (var field in form.fields) {
            if (form.fields.hasOwnProperty(field)) {
                sanitizeField(form.fields[field]);
            }
        }
    },
    loadForm: function() {
        var formId = this.get("formId");
        var self = this;
        $fh.forms.getForm({
            "formId": formId
        }, function(err, form) {
            if (err) {
                self.trigger("error", err);
            } else {
                self.sanitizeForm(form);
                self.coreModel = form;
                self.set("fh_full_data_loaded", true);
                self.id = formId;
            }
        });
    },
    get: function(key) {
        var res = Backbone.Model.prototype.get.apply(this, arguments);
        if (res && res !== "") {
            return res;
        } else if (this.coreModel) {
            return this.coreModel.get(key);
        } else {
            return res;
        }
    },
    initialize: function() {
        _.bindAll(this, "loadForm", "get");
        this.loadForm();
    }
});

FormsCollection = Backbone.Collection.extend({
    model: FormModel,
    comparator: 'name',
    sync: function(method, collection, options) {
        var self = this;
        if (method == "read") {
            $fh.forms.getForms({
                fromRemote: true
            }, function(err, formList) {
                if (err) {
                    self.trigger("error", err);
                    options.error(err);
                } else {
                    var count = formList.size();
                    var formIdArr = [];
                    for (var i = 0; i < formList.size(); i++) {
                        var formId = formList.getFormIdByIndex(i);
                        var formMeta = formList.getFormMetaById(formId);
                        formIdArr.push({
                          name: formMeta.name,
                          formId: formId
                        });
                    }

                    options.success(formIdArr);
                }
            });
        }
    }
});

App.collections.forms = new FormsCollection();
