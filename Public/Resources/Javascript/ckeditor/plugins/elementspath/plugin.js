﻿/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
*/
(function(){var o={editorFocus:!1,readOnly:1,exec:function(a){(a=CKEDITOR.document.getById(a._.elementsPath.idBase+"0"))&&a.focus(CKEDITOR.env.ie||CKEDITOR.env.air)}},m='<span class="cke_path_empty">&nbsp;</span>',d="";if(CKEDITOR.env.opera||CKEDITOR.env.gecko&&CKEDITOR.env.mac)d+=' onkeypress="return false;"';CKEDITOR.env.gecko&&(d+=' onblur="this.style.cssText = this.style.cssText;"');var p=CKEDITOR.addTemplate("pathItem",'<a id="{id}" href="{jsTitle}" tabindex="-1" class="cke_path_item" title="{label}"'+
(CKEDITOR.env.gecko&&10900>CKEDITOR.env.version?' onfocus="event.preventBubble();"':"")+d+' hidefocus="true"  onkeydown="return CKEDITOR.tools.callFunction({keyDownFn},{index}, event );" onclick="CKEDITOR.tools.callFunction({clickFn},{index}); return false;" role="button" aria-label="{label}">{text}</a>');CKEDITOR.plugins.add("elementspath",{lang:"af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en-au,en-ca,en-gb,en,eo,es,et,eu,fa,fi,fo,fr-ca,fr,gl,gu,he,hi,hr,hu,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt-br,pt,ro,ru,sk,sl,sr-latn,sr,sv,th,tr,ug,uk,vi,zh-cn,zh",
init:function(a){function d(b){b=a._.elementsPath.list[b];if(b.equals(a.editable())){var e=a.createRange();e.selectNodeContents(b);e.select()}else a.getSelection().selectElement(b);a.focus()}function h(){i&&i.setHtml(m);delete a._.elementsPath.list}if(a.elementMode!=CKEDITOR.ELEMENT_MODE_INLINE){var l=a.ui.spaceId("path"),i,n="cke_elementspath_"+CKEDITOR.tools.getNextNumber()+"_";a._.elementsPath={idBase:n,filters:[]};a.on("uiSpace",function(b){"bottom"==b.data.space&&(b.data.html+='<span id="'+l+
'_label" class="cke_voice_label">'+a.lang.elementspath.eleLabel+'</span><span id="'+l+'" class="cke_path" role="group" aria-labelledby="'+l+'_label">'+m+"</span>")});a.on("uiReady",function(){var b=a.ui.space("path");b&&a.focusManager.add(b,1)});var q=CKEDITOR.tools.addFunction(d),r=CKEDITOR.tools.addFunction(function(b,e){var c=a._.elementsPath.idBase,f,e=new CKEDITOR.dom.event(e);f="rtl"==a.lang.dir;switch(e.getKeystroke()){case f?39:37:case 9:return(f=CKEDITOR.document.getById(c+(b+1)))||(f=CKEDITOR.document.getById(c+
"0")),f.focus(),!1;case f?37:39:case CKEDITOR.SHIFT+9:return(f=CKEDITOR.document.getById(c+(b-1)))||(f=CKEDITOR.document.getById(c+(a._.elementsPath.list.length-1))),f.focus(),!1;case 27:return a.focus(),!1;case 13:case 32:return d(b),!1}return!0});a.on("selectionChange",function(b){for(var e=a.editable(),c=b.data.selection.getStartElement(),b=[],f=a._.elementsPath.list=[],d=a._.elementsPath.filters;c;){var j=0,g;g=c.data("cke-display-name")?c.data("cke-display-name"):c.data("cke-real-element-type")?
c.data("cke-real-element-type"):c.getName();for(var k=0;k<d.length;k++){var h=d[k](c,g);if(!1===h){j=1;break}g=h||g}j||(j=f.push(c)-1,k=a.lang.elementspath.eleTitle.replace(/%1/,g),g=p.output({id:n+j,label:k,text:g,jsTitle:"javascript:void('"+g+"')",index:j,keyDownFn:r,clickFn:q}),b.unshift(g));if(c.equals(e))break;c=c.getParent()}i||(i=CKEDITOR.document.getById(l));e=i;e.setHtml(b.join("")+m);a.fire("elementsPathUpdate",{space:e})});a.on("readOnly",h);a.on("contentDomUnload",h);a.addCommand("elementsPathFocus",
o);a.setKeystroke(CKEDITOR.ALT+122,"elementsPathFocus")}}})})();