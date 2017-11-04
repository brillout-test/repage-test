const assert = require('reassert');
const assert_usage = assert;
const assert_internal = assert;
const ReactDOM = require('react-dom');
const HtmlCrust = require('@brillout/html-crust');
const {getReactElement, get_initial_props, loadData, get_views} = require('./common');

module.exports = {
    name: require('./package.json').name,
    isAllowedInBrowser: true,
    pageMixin: {
        renderDomLoad: [
            loadData,
        ],
        renderDomApply: [
            renderDomApply,
        ],
    },
};

async function renderDomApply({page, renderDomContext, route}) {
    HtmlCrust.renderToDom(page);

    const views = get_views(page);

    const initial_props = get_initial_props(route, renderDomContext);

    const promises = (
        views.map(view_object => {
            return render_view({view_object, initial_props});
        })
    );

    for(const promise of promises) {
        await promise;
    }
}

function render_view({view_object, initial_props}) {
    const {react_component, container_id} = view_object;
    assert_internal(react_component);
    assert_internal(container_id);

    const react_element = getReactElement({react_component, initial_props});

    const container = get_or_create_container(container_id);

    const do_hydrate = container.firstChild !== null;

    return render_to_dom({react_element, container, do_hydrate});
}

function render_to_dom({react_element, container, do_hydrate}) {
    return new Promise(resolve => {
        do_it(resolve);
    });

    function do_it(resolve) {
        if( do_hydrate ) {
            ReactDOM.hydrate(react_element, container, resolve);
        } else {
            ReactDOM.render(react_element, container, resolve);
        }
    }
}

function get_or_create_container(container_id) {
    let container = document.body.querySelector('#'+container_id);
    if( ! container ) {
        container = create_dom_element({dom_id: container_id});
    }
    return container;
}

function create_dom_element({dom_id}) {
    const el = document.createElement('div');
    el.id = dom_id;
    const firstChild = document.body.firstChild;
    if( ! firstChild ) {
        document.body.appendChild(el);
    } else {
        document.body.insertBefore(el, firstChild);
    }
    return el;
}
