(function(app, $, undefined) {
  "use strict";

  var htmlStr;

  app.init = function() {
    $("form.url").submit(url_onsubmit);
  };

  app.tag_onclick = function(el) {
    var $el = $(el);
    var selected = $el.hasClass("active");
    var tagName;

    $("button.tag").removeClass("active");

    if (!selected) {
      $el.addClass("active");
      tagName = $el.attr("data-name");
    }
    else {
      $el.blur();
    }

    displaySource(htmlStr, tagName);
  };

  function url_onsubmit(e) {
      var url = $("input.url").val();

      e.preventDefault();
      $("img.spinner").show();

      $.ajax({
        method: "GET",
        url: "/proxy?"+$.param({url: url})
      })
      .fail(function() {
        alert("Error fetching data from url \"" + url + "\"");
      })
      .success(function(data) {
        htmlStr = data;
        displayTagButtons(data);
        displaySource(data);
      })
      .always(function() {
        $("img.spinner").hide();
      });
  }

  function displayTagButtons(str) {
    var cnts = countDOMElements(str);
    var templSrc = $("script.tagTempl").html();
    var templ = Handlebars.compile(templSrc);
    var html = templ(cnts);

    $("div.tags").html(html);
  }

  function displaySource(str, selectedTag) {
    var $str = $parse(str);
    var replaceMe_open = "<replaceme:highlight>";
    var replaceMe_close = "</replaceme:highlight>";
    var highlight_open = "<div class='highlight bg-success'>";
    var highlight_close = "</div>";
    var rgxReplaceMe_open = new RegExp(htmlEscape(replaceMe_open), "g");
    var rgxReplaceMe_close = new RegExp(htmlEscape(replaceMe_close), "g");
    var sourceStr;

    if (!selectedTag) {
      sourceStr = getEscapedHTML($str);
      $("div.source").html(sourceStr);
      return;
    }

    //Handling the <html> tag differently since jquery's
    //  ".wrap" breaks when applied to the top-level element
    if (selectedTag == "html") {
      sourceStr = highlight_open + getEscapedHTML($str) + highlight_close;
      $("div.source").html(sourceStr);
      return;
    }

    $str.find(selectedTag).wrap(replaceMe_open + replaceMe_close);

    sourceStr = getEscapedHTML($str);
    sourceStr = sourceStr.replace(rgxReplaceMe_open, highlight_open);
    sourceStr = sourceStr.replace(rgxReplaceMe_close, highlight_close);
  
    $("div.source").html(sourceStr);
  }

  function getEscapedHTML($str) {
    return htmlEscape($str[0].documentElement.outerHTML);
  }

  function countDOMElements(str) {
    var counts = {};
    var $str = $parse(str);
    var nodes = $.makeArray($str);
    var node, tag;

    while (nodes.length > 0) {
      node = nodes.pop();
      tag = node.localName;
      if (tag) {
        if (!counts[tag]) {
          counts[tag] = 1;
        }
        else {
          counts[tag]++;
        }
      }
      nodes = nodes.concat($.makeArray(node.childNodes));
    }

    return mapToArray(counts);
  }

  //Parse the string this way (instead of simply "$(str)")
  //  so that the browser doesn't try to load any referenced
  //  images. Source http://stackoverflow.com/a/24942064
  function $parse (str) {
    var htmlDoc = (new DOMParser()).parseFromString(str, "text/html");
    return $(htmlDoc);
  }

  function htmlEscape(str) {
    return $("<div/>").text(str).html();
  }

  function mapToArray(map) {
    var array = [];
    var item;
    for (var key in map) {
      if (map.hasOwnProperty(key)) {
        item = {};
        item.key = key;
        item.value = map[key]; 
        array.push(item);
      }
    }
    return array;
  }
})(window.app = window.app || {}, jQuery);