const assert = require('reassert');
const assert_usage = assert;
const assert_internal = assert;
const ReactDOMServer = require('react-dom/server');
const HtmlCrust = require('@brillout/html-crust');
const {getReactElement, loadData, get_views, get_initial_props} = require('./common');

module.exports = {
    name: require('./package.json').name,
    pageMixin: {
        renderHtmlLoad: [
            loadData,
        ],
        renderHtmlApply: [
            renderHtmlApply,
        ],
    },
};

function renderHtmlApply ({page, renderHtmlContext, route}) {
    const views = get_views(page);

    assert_usage(
        views.length<2,
        page,
        "The page printed above has more than one view. But multiple views only makes sense in the browser."
    );

    const body_html = get_body_html({views, renderHtmlContext, route});

    const html = HtmlCrust.renderToHtml({...page, body: body_html});

    renderHtmlContext.html = html;
}

function get_body_html({views, renderHtmlContext, route}) {
    if( views.length===0 ) {
        return '';
    }

    const {react_component, container_id} = views[0];
    assert_internal(react_component);
    assert_internal(container_id);

    const initial_props = get_initial_props(route, renderHtmlContext);

    const react_element = getReactElement({react_component, initial_props});

    let body_html = ReactDOMServer.renderToStaticMarkup(react_element);
    body_html = '<div id="'+container_id+'">'+body_html+'</div>';

    return body_html;
}
