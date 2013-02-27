function ContextMenu(id) {
    this.div = document.getElementById(id);
}

ContextMenu.MAX_CHAR_TITLE = 34;
ContextMenu.MAX_CHAR_SUMMARY = 196;

ContextMenu.prototype.display = function(title, summary, pos_y) {
    title = ContextMenu.trim(title);
    summary = ContextMenu.trim(summary);

    if (titleIsLongerThanMax() || summaryIsShorterThanMax()) {
        show(this.div);
    }

    function titleIsLongerThanMax() {
        return title.length > ContextMenu.MAX_CHAR_TITLE;
    }

    function summaryIsShorterThanMax() {
        return summary.length > 0 && 
                summary.length < ContextMenu.MAX_CHAR_SUMMARY;
    }

    function show(div) {
        div.innerHTML = format();
        if (pos_y < 400) {
            div.setAttribute('style', 'display: block; bottom: 0px');
        } else {
            div.setAttribute('style', 'display: block; top: 0px');
        }
    }

    function format() {
        return summary ? "<b>" + title + "</b>" + "<br/><br/>" + summary : title;
    }
}

ContextMenu.trim = function(str) {
    return str ? str.replace(/^\s+|\s+$/g, '') : "";
}

ContextMenu.prototype.clear = function() {
    this.div.innerHTML = "";
    this.div.setAttribute('style', 'display: none');
}

function attachContextMenu(tags, contextmenu) {
    tags.forEach(function(tag) {
        tag.addEventListener('mouseover', function(e) {
            contextmenu.display(this.getAttribute('title'), 
                this.getAttribute('alt'), e.pageY);
        });
        tag.addEventListener('mouseout', function() {
            contextmenu.clear();
        });
    });
}

function getLinks(klass) {
    var result = [];
    var links = document.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.getAttribute('class') == klass) {
            result.push(link);
        }
    }
    return result;
}
