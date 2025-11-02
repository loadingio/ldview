 (function() { function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_attrs(t,r){var a="";for(var s in t)if(pug_has_own_property.call(t,s)){var u=t[s];if("class"===s){u=pug_classes(u),a=pug_attr(s,u,!1,r)+a;continue}"style"===s&&(u=pug_style(u)),a+=pug_attr(s,u,!1,r)}return a}
function pug_classes(s,r){return Array.isArray(s)?pug_classes_array(s,r):s&&"object"==typeof s?pug_classes_object(s):s||""}
function pug_classes_array(r,a){for(var s,e="",u="",c=Array.isArray(a),g=0;g<r.length;g++)(s=pug_classes(r[g]))&&(c&&a[g]&&(s=pug_escape(s)),e=e+u+s,u=" ");return e}
function pug_classes_object(r){var a="",n="";for(var o in r)o&&r[o]&&pug_has_own_property.call(r,o)&&(a=a+n+o,n=" ");return a}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_has_own_property=Object.prototype.hasOwnProperty;
var pug_match_html=/["&<>]/;
function pug_merge(e,r){if(1===arguments.length){for(var t=e[0],g=1;g<e.length;g++)t=pug_merge(t,e[g]);return t}for(var l in r)if("class"===l){var n=e[l]||[];e[l]=(Array.isArray(n)?n:[n]).concat(r[l]||[])}else if("style"===l){var n=pug_style(e[l]);n=n&&";"!==n[n.length-1]?n+";":n;var a=pug_style(r[l]);a=a&&";"!==a[a.length-1]?a+";":a,e[l]=n+a}else e[l]=r[l];return e}
function pug_style(r){if(!r)return"";if("object"==typeof r){var t="";for(var e in r)pug_has_own_property.call(r,e)&&(t=t+e+":"+r[e]+";");return t}return r+""}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;
    var locals_for_with = (locals || {});
    
    (function (Array, JSON, b64img, blockLoader, c, cssLoader, decache, defer, escape, hashfile, libLoader, md5, prefix, scriptLoader, url, version) {
      pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
if(!libLoader) {
  libLoader = {
    js: {url: {}},
    css: {url: {}},
    root: function(r) { libLoader._r = r; },
    _r: "/assets/lib",
    _v: "",
    version: function(v) { libLoader._v = (v ? "?v=" + v : ""); }
  }
  if(version) { libLoader.version(version); }
}

pug_mixins["script"] = pug_interp = function(os,cfg){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var str = '', urls = [];
if(!Array.isArray(os)) { os = [os]; }
// iterate os
;(function(){
  var $$obj = os;
  if ('number' == typeof $$obj.length) {
      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {
        var o = $$obj[pug_index0];
c = o;
if(typeof(o) == "string") { url = o; c = cfg || {};}
else if(o.url) { url = o.url; }
else { url = libLoader._r + "/" + o.name + "/" + (o.version || 'main') + "/" + (o.path || "index.min.js"); }
if (!libLoader.js.url[url]) {
libLoader.js.url[url] = true;
defer = (typeof(c.defer) == "undefined" ? true : !!c.defer);
if (/^https?:\/\/./.exec(url)) {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url, true, true)+pug_attr("defer", defer, true, true)+pug_attr("async", !!c.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
else
if (cfg && cfg.pack) {
str = str + ';' + url;
urls.push(url);
}
else {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url + libLoader._v, true, true)+pug_attr("defer", defer, true, true)+pug_attr("async", !!c.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
}
      }
  } else {
    var $$l = 0;
    for (var pug_index0 in $$obj) {
      $$l++;
      var o = $$obj[pug_index0];
c = o;
if(typeof(o) == "string") { url = o; c = cfg || {};}
else if(o.url) { url = o.url; }
else { url = libLoader._r + "/" + o.name + "/" + (o.version || 'main') + "/" + (o.path || "index.min.js"); }
if (!libLoader.js.url[url]) {
libLoader.js.url[url] = true;
defer = (typeof(c.defer) == "undefined" ? true : !!c.defer);
if (/^https?:\/\/./.exec(url)) {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url, true, true)+pug_attr("defer", defer, true, true)+pug_attr("async", !!c.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
else
if (cfg && cfg.pack) {
str = str + ';' + url;
urls.push(url);
}
else {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url + libLoader._v, true, true)+pug_attr("defer", defer, true, true)+pug_attr("async", !!c.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
}
    }
  }
}).call(this);

if (cfg && cfg.pack) {
var name = md5(str);
//var filename = "/js/pack/" + name + "." + (typeof(cfg.min) == "undefined" || cfg.min ? "min" : "") + ".js";
var fn = "/assets/bundle/" + name + "." + (typeof(cfg.min) == "undefined" || cfg.min ? "min" : "") + ".js";
hashfile({type: "js", name: name, files: urls, src: locals.filename});
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", fn + libLoader._v, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
};
pug_mixins["css"] = pug_interp = function(os,cfg){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var str = '', urls = [];
if(!Array.isArray(os)) { os = [os]; }
// iterate os
;(function(){
  var $$obj = os;
  if ('number' == typeof $$obj.length) {
      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {
        var o = $$obj[pug_index1];
c = o;
if(typeof(o) == "string") { url = o; c = cfg || {};}
else if(o.url) { url = o.url; }
else { url = libLoader._r + "/" + o.name + "/" + (o.version || 'main') + "/" + (o.path || "index.min.css"); }
if (!libLoader.css.url[url]) {
libLoader.css.url[url] = true;
if (/^https?:\/\/./.exec(url)) {
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", url, true, true)) + "\u003E";
}
else
if (cfg && cfg.pack) {
str = str + ';' + url;
urls.push(url);
}
else {
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", url + libLoader._v, true, true)) + "\u003E";
}
}
      }
  } else {
    var $$l = 0;
    for (var pug_index1 in $$obj) {
      $$l++;
      var o = $$obj[pug_index1];
c = o;
if(typeof(o) == "string") { url = o; c = cfg || {};}
else if(o.url) { url = o.url; }
else { url = libLoader._r + "/" + o.name + "/" + (o.version || 'main') + "/" + (o.path || "index.min.css"); }
if (!libLoader.css.url[url]) {
libLoader.css.url[url] = true;
if (/^https?:\/\/./.exec(url)) {
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", url, true, true)) + "\u003E";
}
else
if (cfg && cfg.pack) {
str = str + ';' + url;
urls.push(url);
}
else {
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", url + libLoader._v, true, true)) + "\u003E";
}
}
    }
  }
}).call(this);

if (cfg && cfg.pack) {
var name = md5(str);
//var filename = "/css/pack/" + name + "." + (typeof(cfg.min) == "undefined" || cfg.min ? "min" : "") + ".css";
var fn = "/assets/bundle/" + name + "." + (typeof(cfg.min) == "undefined" || cfg.min ? "min" : "") + ".css";
hashfile({type: "css", name: name, files: urls, src: locals.filename});
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", fn + libLoader._v, true, true)) + "\u003E";
}
};
pug_html = pug_html + "\u003Chtml\u003E";
if (!(libLoader || scriptLoader)) {
if(!scriptLoader) { scriptLoader = {url: {}, config: {}}; }
if(!decache) { decache = (version? "?v=" + version : ""); }
pug_mixins["script"] = pug_interp = function(url,config){
var block = (this && this.block), attributes = (this && this.attributes) || {};
scriptLoader.config = (config ? config : {});
if (!scriptLoader.url[url]) {
scriptLoader.url[url] = true;
if (/^https?:\/\/./.exec(url)) {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url, true, true)+pug_attr("defer", !!scriptLoader.config.defer, true, true)+pug_attr("async", !!scriptLoader.config.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
else {
pug_html = pug_html + "\u003Cscript" + (" type=\"text\u002Fjavascript\""+pug_attr("src", url + decache, true, true)+pug_attr("defer", !!scriptLoader.config.defer, true, true)+pug_attr("async", !!scriptLoader.config.async, true, true)) + "\u003E\u003C\u002Fscript\u003E";
}
}
};
if(!cssLoader) { cssLoader = {url: {}}; }
pug_mixins["css"] = pug_interp = function(url,config){
var block = (this && this.block), attributes = (this && this.attributes) || {};
cssLoader.config = (config ? config : {});
if (!cssLoader.url[url]) {
cssLoader.url[url] = true;
pug_html = pug_html + "\u003Clink" + (" rel=\"stylesheet\" type=\"text\u002Fcss\""+pug_attr("href", url + decache, true, true)) + "\u003E";
}
};
if(!blockLoader) { blockLoader = {name: {}, config: {}}; }







}
var escjson = function(obj) { return 'JSON.parse(unescape("' + escape(JSON.stringify(obj)) + '"))'; };
var eschtml = (function() { var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;' }; var repl = function(c) { return MAP[c]; }; return function(s) { return s.replace(/[&<>'"]/g, repl); }; })();
function ellipsis(str, len) {
  return ((str || '').substring(0, len || 200) + (((str || '').length > (len || 200)) ? '...' : ''));
}














var b64img = {};
b64img.px1 = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIA"
var loremtext = {
  zh: "料何緊許團人受間口語日是藝一選去，得系目、再驗現表爸示片球法中轉國想我樹我，色生早都沒方上情精一廣發！能生運想毒一生人一身德接地，說張在未安人、否臺重壓車亞是我！終力邊技的大因全見起？切問去火極性現中府會行多他千時，來管表前理不開走於展長因，現多上我，工行他眼。總務離子方區面人話同下，這國當非視後得父能民觀基作影輕印度民雖主他是一，星月死較以太就而開後現：國這作有，他你地象的則，引管戰照十都是與行求證來亞電上地言裡先保。大去形上樹。計太風何不先歡的送但假河線己綠？計像因在……初人快政爭連合多考超的得麼此是間不跟代光離制不主政重造的想高據的意臺月飛可成可有時情乎為灣臺我養家小，叫轉於可！錢因其他節，物如盡男府我西上事是似個過孩而過要海？更神施一關王野久沒玩動一趣庭顧倒足要集我民雲能信爸合以物頭容戰度系士我多學一、區作一，過業手：大不結獨星科表小黨上千法值之兒聲價女去大著把己。",
  en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
};













prefix = function(n) { return (!n?[]:(Array.isArray(n)?n:[n])).map(function(it){ return `${prefix.currentName}$${it}`; }).join(' ');}
pug_mixins["scope"] = pug_interp = function(name){
var block = (this && this.block), attributes = (this && this.attributes) || {};
var parentName = prefix.currentName;
prefix.currentName = name;
if (attributes.class && /naked-scope/.exec(attributes.class)) {
block && block();
}
else {
pug_html = pug_html + "\u003Cdiv" + (pug_attrs(pug_merge([{"ld-scope": pug_escape(name || '')},attributes]), true)) + "\u003E";
block && block();
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
}
prefix.currentName = parentName;
};
pug_html = pug_html + "\u003Chead\u003E";
pug_mixins["css"]("/assets/lib/bootstrap/main/dist/css/bootstrap.min.css");
pug_mixins["css"]("/assets/lib/@loadingio/bootstrap.ext/main/index.min.css");
pug_html = pug_html + "\u003Cstyle type=\"text\u002Fcss\"\u003E.test-section {\n  margin: 30px 0;\n  padding: 20px;\n  border: 2px solid #007bff;\n  border-radius: 8px;\n}\n.test-section h2 {\n  color: #007bff;\n  margin-top: 0;\n}\n.output {\n  margin: 15px 0;\n  padding: 15px;\n  background: #f8f9fa;\n  border-radius: 4px;\n  font-family: monospace;\n}\n.label {\n  font-weight: bold;\n  color: #666;\n}\nbutton {\n  margin: 5px;\n}\n.item {\n  padding: 10px;\n  margin: 5px 0;\n  background: #e9ecef;\n  border-radius: 4px;\n}\n\u003C\u002Fstyle\u003E\u003C\u002Fhead\u003E\u003Cbody\u003E\u003Cdiv class=\"w-1024 rwd mx-auto typeset heading-contrast my-4\"\u003E\u003Ch1\u003Eldreactive + ldview Integration Tests\u003C\u002Fh1\u003E\u003Cdiv class=\"text-muted\"\u003ETest integration between ldreactive.ls and ldview.ls with automatic reactive updates\u003C\u002Fdiv\u003E\u003Chr\u003E\u003C!-- Test 1: Basic Counter - Property Tracking--\u003E\u003Cdiv class=\"test-section\"\u003E\u003Ch2\u003ETest 1: Basic Counter (Property Tracking)\u003C\u002Fh2\u003E\u003Cdiv class=\"text-muted\"\u003ETests basic reactive property tracking and automatic updates\u003C\u002Fdiv\u003E";
pug_mixins["scope"].call({
block: function(){
pug_html = pug_html + "\u003Cdiv class=\"output\"\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003ECount: \u003C\u002Fspan\u003E\u003Cspan ld=\"count\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003ERender count: \u003C\u002Fspan\u003E\u003Cspan ld=\"renderCount\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"increment\"\u003EIncrement\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-secondary\" ld=\"decrement\"\u003EDecrement\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-warning\" ld=\"reset\"\u003EReset\u003C\u002Fbutton\u003E";
}
}, "test1");
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C!-- Test 2: Nested Object Tracking--\u003E\u003Cdiv class=\"test-section\"\u003E\u003Ch2\u003ETest 2: Nested Object Tracking\u003C\u002Fh2\u003E\u003Cdiv class=\"text-muted\"\u003ETests deep property tracking in nested objects\u003C\u002Fdiv\u003E";
pug_mixins["scope"].call({
block: function(){
pug_html = pug_html + "\u003Cdiv class=\"output\"\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EStreet: \u003C\u002Fspan\u003E\u003Cspan ld=\"street\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003ECity: \u003C\u002Fspan\u003E\u003Cspan ld=\"city\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003ECountry: \u003C\u002Fspan\u003E\u003Cspan ld=\"country\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EFull Address: \u003C\u002Fspan\u003E\u003Cspan ld=\"fullAddress\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"changeStreet\"\u003EChange Street\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"changeCity\"\u003EChange City\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"changeCountry\"\u003EChange Country\u003C\u002Fbutton\u003E";
}
}, "test2");
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C!-- Test 3: Array\u002FList Tracking--\u003E\u003Cdiv class=\"test-section\"\u003E\u003Ch2\u003ETest 3: Array\u002FList Tracking\u003C\u002Fh2\u003E\u003Cdiv class=\"text-muted\"\u003ETests array operations and list rendering\u003C\u002Fdiv\u003E";
pug_mixins["scope"].call({
block: function(){
pug_html = pug_html + "\u003Cdiv class=\"output\"\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003ETotal Items: \u003C\u002Fspan\u003E\u003Cspan ld=\"count\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv class=\"mt-3\" ld-each=\"item\"\u003E\u003Cdiv class=\"item\" ld=\"text\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbutton class=\"btn btn-success\" ld=\"addItem\"\u003EAdd Item\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-danger\" ld=\"removeItem\"\u003ERemove Last\u003C\u002Fbutton\u003E";
}
}, "test3");
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C!-- Test 4: Batch Updates--\u003E\u003Cdiv class=\"test-section\"\u003E\u003Ch2\u003ETest 4: Batch Updates\u003C\u002Fh2\u003E\u003Cdiv class=\"text-muted\"\u003ETests batching multiple updates into a single render\u003C\u002Fdiv\u003E";
pug_mixins["scope"].call({
block: function(){
pug_html = pug_html + "\u003Cdiv class=\"output\"\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EName: \u003C\u002Fspan\u003E\u003Cspan ld=\"name\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EAge: \u003C\u002Fspan\u003E\u003Cspan ld=\"age\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EEmail: \u003C\u002Fspan\u003E\u003Cspan ld=\"email\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EBatch render count: \u003C\u002Fspan\u003E\u003Cspan ld=\"batchCount\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"updateAll\"\u003EUpdate All (Batch)\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-secondary\" ld=\"updateSeparate\"\u003EUpdate Separately\u003C\u002Fbutton\u003E";
}
}, "test4");
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C!-- Test 5: Manual Render Control--\u003E\u003Cdiv class=\"test-section\"\u003E\u003Ch2\u003ETest 5: Manual Render Control (reactive: false)\u003C\u002Fh2\u003E\u003Cdiv class=\"text-muted\"\u003ETests disabling automatic reactive updates for specific handlers\u003C\u002Fdiv\u003E";
pug_mixins["scope"].call({
block: function(){
pug_html = pug_html + "\u003Cdiv class=\"output\"\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EAuto Value: \u003C\u002Fspan\u003E\u003Cspan ld=\"autoValue\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EManual Value: \u003C\u002Fspan\u003E\u003Cspan ld=\"manualValue\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EAuto render count: \u003C\u002Fspan\u003E\u003Cspan ld=\"autoCount\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003Cdiv\u003E\u003Cspan class=\"label\"\u003EManual render count: \u003C\u002Fspan\u003E\u003Cspan ld=\"manualCount\"\u003E\u003C\u002Fspan\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003Cbutton class=\"btn btn-primary\" ld=\"changeValue\"\u003EChange Value\u003C\u002Fbutton\u003E\u003Cbutton class=\"btn btn-warning\" ld=\"manualRender\"\u003EManual Render\u003C\u002Fbutton\u003E";
}
}, "test5");
pug_html = pug_html + "\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
pug_mixins["script"]("/assets/lib/@loadingio/ldquery/main/index.min.js");
pug_mixins["script"]("/assets/lib/ldview/dev/ldreactive.js");
pug_mixins["script"]("/assets/lib/ldview/dev/index.js");
pug_html = pug_html + "\u003Cscript type=\"module\"\u003E(function(){var n,r,o;console.log(\"Test 1: Basic Counter\");n=new ldreactive({count:0});r=0;o=new ldview({ctx:n,root:\"[ld-scope=test1]\",handler:{count:function(n){var t,e;t=n.node,e=n.ctx;r++;return t.textContent=e.count},renderCount:function(n){var t;t=n.node;return t.textContent=r},increment:function(n){var t,e;t=n.node,e=n.ctx;return t.onclick=function(){e.count++;return o.render(\"renderCount\")}},decrement:function(n){var t,e;t=n.node,e=n.ctx;return t.onclick=function(){e.count--;return o.render(\"renderCount\")}},reset:function(n){var t,e;t=n.node,e=n.ctx;return t.onclick=function(){e.count=0;return o.render(\"renderCount\")}}}});return console.log(\"Test 1 initialized\")})();(function(){var n,t;console.log(\"Test 2: Nested Object Tracking\");n=new ldreactive({address:{street:\"123 Main St\",city:\"New York\",country:\"USA\"}});t=new ldview({ctx:n,root:\"[ld-scope=test2]\",handler:{street:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.address.street},city:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.address.city},country:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.address.country},fullAddress:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.address.street+\", \"+e.address.city+\", \"+e.address.country},changeStreet:function(n){var t,e,r;t=n.node,e=n.ctx;r=[\"456 Oak Ave\",\"789 Elm St\",\"321 Pine Rd\",\"654 Maple Dr\"];return t.onclick=function(){return e.address.street=r[Math.floor(Math.random()*r.length)]}},changeCity:function(n){var t,e,r;t=n.node,e=n.ctx;r=[\"Los Angeles\",\"Chicago\",\"Houston\",\"Phoenix\"];return t.onclick=function(){return e.address.city=r[Math.floor(Math.random()*r.length)]}},changeCountry:function(n){var t,e,r;t=n.node,e=n.ctx;r=[\"USA\",\"Canada\",\"UK\",\"Australia\"];return t.onclick=function(){return e.address.country=r[Math.floor(Math.random()*r.length)]}}}});return console.log(\"Test 2 initialized\")})();(function(){var r,n,t;console.log(\"Test 3: Array\u002FList Tracking\");r=0;n=new ldreactive({items:[]});t=new ldview({ctx:n,root:\"[ld-scope=test3]\",handler:{count:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.items.length},item:{list:function(n){var t;t=n.ctx;return t.items},view:{text:{text:function(n){var t;t=n.ctx;return t.text}}}},addItem:function(n){var t,e;t=n.node,e=n.ctx;return t.onclick=function(){r++;return e.items.push({text:\"Item #\"+r})}},removeItem:function(n){var t,e;t=n.node,e=n.ctx;return t.onclick=function(){if(e.items.length\u003E0){return e.items.pop()}}}}});return console.log(\"Test 3 initialized\")})();(function(){var e,r,o;console.log(\"Test 4: Batch Updates\");e=new ldreactive({name:\"John\",age:25,email:\"john@example.com\"});r=0;e.on(\"change\",function(n,t,e){return r++});o=new ldview({ctx:e,root:\"[ld-scope=test4]\",handler:{name:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.name},age:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.age},email:function(n){var t,e;t=n.node,e=n.ctx;return t.textContent=e.email},batchCount:function(n){var t;t=n.node;return t.textContent=r},updateAll:function(n){var t;t=n.node;return t.onclick=function(){var n,t;n=t;e.batch(function(){var n;n=e.get();n.name=\"Jane\";n.age=30;return n.email=\"jane@example.com\"});t=n+1;return o.render(\"batchCount\")}},updateSeparate:function(n){var t;t=n.node;return t.onclick=function(){var n;n=e.get();n.name=\"Bob\";n.age=35;n.email=\"bob@example.com\";return o.render(\"batchCount\")}}}});return console.log(\"Test 4 initialized\")})();(function(){var e,r,o,c;console.log(\"Test 5: Manual Render Control\");e=new ldreactive({value:100});r=0;o=0;c=new ldview({ctx:e,root:\"[ld-scope=test5]\",handler:{autoValue:function(n){var t,e;t=n.node,e=n.ctx;r++;return t.textContent=e.value},manualValue:{reactive:false,handler:function(n){var t,e;t=n.node,e=n.ctx;o++;return t.textContent=e.value}},autoCount:function(n){var t;t=n.node;return t.textContent=r},manualCount:function(n){var t;t=n.node;return t.textContent=o},changeValue:function(n){var t;t=n.node;return t.onclick=function(){var n;n=e.get();n.value=Math.floor(Math.random()*1e3);return c.render(\"autoCount\")}},manualRender:function(n){var t;t=n.node;return t.onclick=function(){c.render(\"manualValue\");return c.render(\"manualCount\")}}}});return console.log(\"Test 5 initialized\")})();console.log(\"All reactive integration tests initialized\");\u003C\u002Fscript\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";
    }.call(this, "Array" in locals_for_with ?
        locals_for_with.Array :
        typeof Array !== 'undefined' ? Array : undefined, "JSON" in locals_for_with ?
        locals_for_with.JSON :
        typeof JSON !== 'undefined' ? JSON : undefined, "b64img" in locals_for_with ?
        locals_for_with.b64img :
        typeof b64img !== 'undefined' ? b64img : undefined, "blockLoader" in locals_for_with ?
        locals_for_with.blockLoader :
        typeof blockLoader !== 'undefined' ? blockLoader : undefined, "c" in locals_for_with ?
        locals_for_with.c :
        typeof c !== 'undefined' ? c : undefined, "cssLoader" in locals_for_with ?
        locals_for_with.cssLoader :
        typeof cssLoader !== 'undefined' ? cssLoader : undefined, "decache" in locals_for_with ?
        locals_for_with.decache :
        typeof decache !== 'undefined' ? decache : undefined, "defer" in locals_for_with ?
        locals_for_with.defer :
        typeof defer !== 'undefined' ? defer : undefined, "escape" in locals_for_with ?
        locals_for_with.escape :
        typeof escape !== 'undefined' ? escape : undefined, "hashfile" in locals_for_with ?
        locals_for_with.hashfile :
        typeof hashfile !== 'undefined' ? hashfile : undefined, "libLoader" in locals_for_with ?
        locals_for_with.libLoader :
        typeof libLoader !== 'undefined' ? libLoader : undefined, "md5" in locals_for_with ?
        locals_for_with.md5 :
        typeof md5 !== 'undefined' ? md5 : undefined, "prefix" in locals_for_with ?
        locals_for_with.prefix :
        typeof prefix !== 'undefined' ? prefix : undefined, "scriptLoader" in locals_for_with ?
        locals_for_with.scriptLoader :
        typeof scriptLoader !== 'undefined' ? scriptLoader : undefined, "url" in locals_for_with ?
        locals_for_with.url :
        typeof url !== 'undefined' ? url : undefined, "version" in locals_for_with ?
        locals_for_with.version :
        typeof version !== 'undefined' ? version : undefined));
    ;;return pug_html;}; module.exports = template; })() 