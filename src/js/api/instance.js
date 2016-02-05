import $ from 'jquery';

export default function (UIkit) {

    const DATA = UIkit.data;

    UIkit.prototype.$mount = function (el) {

        var name = this.$options.name;

        if (!el[DATA]) {
            el[DATA] = {};
            UIkit.elements.push(el);
        }

        if (el[DATA][name]) {
            console.warn(`Component "${name}" is already mounted on element: ${el}`);
        }

        el[DATA][name] = this;

        this.$el = $(el);

        this._initProps();
        this._callHook('ready');
    };

    UIkit.prototype.$update = function (e) {
        this.$broadcast('update', getUpdateEvent(e));
    };

    UIkit.prototype.$updateParents = function (e) {
        this.$dispatch('update', getUpdateEvent(e));
    };

    UIkit.prototype.$broadcast = function (hook, e) {
        $(UIkit.elements, this.$el).each(function () {
            if (this[DATA]) {
                for (var name in this[DATA]) {
                    this[DATA][name]._callHook(hook, e);
                }
            }
        });
    };

    UIkit.prototype.$dispatch = function (hook, e) {
        $(UIkit.elements).each((i, el) => {
            if (el[DATA] && $.contains(el, this.$el[0])) {
                for (var name in el[DATA]) {
                    el[DATA][name]._callHook(hook, e);
                }
            }
        });
    };

    UIkit.prototype.$replace = function (el) {

        el = $(el);

        UIkit.elements.splice(UIkit.elements.indexOf(this.$options.el), 1, el[0]);
        this.$el.replaceWith(el);
        this.$options.el = el[0];
        this.$el = el;

        this.__preventDestroy = true;

        this.$updateParents();

    };

    UIkit.prototype.$destroy = function () {

        if (this.__preventDestroy) {
            this.__preventDestroy = false;
            return;
        }

        this._callHook('destroy');

        delete UIkit.instances[this._uid];

        if (!this.$options.el) {
            return;
        }

        var el = this.$options.el;
        delete el[DATA][this.$options.name];

        if (!Object.keys(el[DATA]).length) {
            delete el[DATA];
            delete UIkit.elements[UIkit.elements.indexOf(el)];
        }

        this.$el.remove();
    };

    function getUpdateEvent(e) {

        if (!e) {
            e = 'update';
        }

        if (typeof e === 'string') {
            var ev = document.createEvent('Event');
            ev.initEvent(e, true, false);
            e = ev;
        }

        return e;
    }
}