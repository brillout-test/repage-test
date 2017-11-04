const assert = require('reassert');
const assert_usage = assert;
const assert_internal = assert;

const React = require('react');

const rootContainerId = 'react-root';

module.exports = {
    getReactElement,
    get_initial_props,
    loadData,
    get_views,
};

function get_initial_props(route, contextObject) {
    assert_internal(route);
    assert_internal(contextObject.initialProps, contextObject);
    const initial_props = Object.assign({route}, contextObject.initialProps);
    return initial_props;
}

function getReactElement({react_component, initial_props}) {
    return React.createElement(react_component, initial_props);
}

function get_views(page) {
    const {view: view_page_prop} = page;

    if( ! view_page_prop ) {
        return [];
    }

    const views = (
        (
            view_page_prop.constructor !== Array ? (
                [view_page_prop]
            ) : (
                view_page_prop
            )
        ).map(view => {
            assert_usage(
                view
            );
            if( view.constructor!==Object || ! view.view ) {
                return {
                    react_component: view,
                    container_id: rootContainerId,
                };
            }
            return {
                react_component: view.view,
                container_id: view.containerId || rootContainerId,
            };
        })
    );

    views.forEach((view_object, i) => {
        assert_internal(view_object.react_component);
        assert_internal(view_object.container_id);
        assert_internal(Object.keys(view_object).length===2);

        views.slice(0, i).forEach(view_object_2 => {
            assert_usage(
                view_object.container_id !== view_object_2.container_id,
                page,
                view_object,
                view_object_2,
                "The two views printed above of the page printed above have the same container id"
            );
        });
    });

    return views;
}

async function loadData(args) {
    const {page, renderHtmlContext, renderDomContext} = args;
    assert(!renderHtmlContext || !renderDomContext);
    const context = renderHtmlContext || renderDomContext;
    context.initialProps = (
        page.getInitialProps ? (
            await page.getInitialProps(args)
        ) : (
            {}
        )
    );
}
