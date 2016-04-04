define(["mvc/history/history-view","mvc/history/history-contents","mvc/dataset/states","mvc/history/hda-model","mvc/history/hda-li-edit","mvc/history/hdca-li-edit","mvc/tag","mvc/annotation","mvc/collection/list-collection-creator","mvc/collection/pair-collection-creator","mvc/collection/list-of-pairs-collection-creator","ui/fa-icon-button","mvc/ui/popup-menu","mvc/base-mvc","utils/localization","ui/editable-text"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o){"use strict";var p=a.HistoryView,q=p.extend({HDAViewClass:e.HDAListItemEdit,HDCAViewClass:f.HDCAListItemEdit,initialize:function(a){a=a||{},p.prototype.initialize.call(this,a),this.tagsEditor=null,this.annotationEditor=null,this.purgeAllowed=a.purgeAllowed||!1,this.annotationEditorShown=a.annotationEditorShown||!1,this.tagsEditorShown=a.tagsEditorShown||!1},_setUpListeners:function(){var a=this;p.prototype._setUpListeners.call(a),a.on("drop",function(b,c){a.dataDropped(c),a.dropTargetOff()}),a.on("view:attached view:removed",function(){a._renderCounts()})},_setUpModelListeners:function(){return p.prototype._setUpModelListeners.call(this),this.listenTo(this.model,"change:size",this.updateHistoryDiskSize),this},_setUpCollectionListeners:function(){return p.prototype._setUpCollectionListeners.call(this),this.listenTo(this.collection,{"change:deleted":this._handleHdaDeletionChange,"change:visible":this._handleHdaVisibleChange,"change:purged":function(){this.model.fetch()},"fetching-deleted":function(){this.$("> .controls .toggle-deleted-link").parent().html("<i>"+o("loading deleted...")+"</i>")},"fetching-hidden":function(){this.$("> .controls .toggle-hidden-link").parent().html("<i>"+o("loading hidden...")+"</i>")},"fetching-deleted-done fetching-hidden-done":this._renderCounts}),this},_buildNewRender:function(){var a=p.prototype._buildNewRender.call(this);return this.model?(Galaxy&&Galaxy.user&&Galaxy.user.id&&Galaxy.user.id===this.model.get("user_id")&&(this._renderTags(a),this._renderAnnotation(a)),a):a},renderItems:function(a){var b=p.prototype.renderItems.call(this,a);return this._renderCounts(a),b},_renderCounts:function(a){a=a instanceof jQuery?a:this.$el;var b=this.templates.counts(this.model.toJSON(),this);return a.find("> .controls .subtitle").html(b)},_renderTags:function(a){var b=this;this.tagsEditor=new g.TagsEditor({model:this.model,el:a.find(".controls .tags-display"),onshowFirstTime:function(){this.render()},onshow:function(){b.toggleHDATagEditors(!0,b.fxSpeed)},onhide:function(){b.toggleHDATagEditors(!1,b.fxSpeed)},$activator:l({title:o("Edit history tags"),classes:"history-tag-btn",faIcon:"fa-tags"}).appendTo(a.find(".controls .actions"))})},_renderAnnotation:function(a){var b=this;this.annotationEditor=new h.AnnotationEditor({model:this.model,el:a.find(".controls .annotation-display"),onshowFirstTime:function(){this.render()},onshow:function(){b.toggleHDAAnnotationEditors(!0,b.fxSpeed)},onhide:function(){b.toggleHDAAnnotationEditors(!1,b.fxSpeed)},$activator:l({title:o("Edit history annotation"),classes:"history-annotate-btn",faIcon:"fa-comment"}).appendTo(a.find(".controls .actions"))})},_setUpBehaviors:function(a){if(a=a||this.$el,p.prototype._setUpBehaviors.call(this,a),this.model&&Galaxy.user&&!Galaxy.user.isAnonymous()&&Galaxy.user.id===this.model.get("user_id")){var b=this,c="> .controls .name";a.find(c).attr("title",o("Click to rename history")).tooltip({placement:"bottom"}).make_text_editable({on_finish:function(a){var d=b.model.get("name");a&&a!==d?(b.$el.find(c).text(a),b.model.save({name:a}).fail(function(){b.$el.find(c).text(b.model.previous("name"))})):b.$el.find(c).text(d)}})}},multiselectActions:function(){var a=this,b=[{html:o("Hide datasets"),func:function(){var b=d.HistoryDatasetAssociation.prototype.hide;a.getSelectedModels().ajaxQueue(b)}},{html:o("Unhide datasets"),func:function(){var b=d.HistoryDatasetAssociation.prototype.unhide;a.getSelectedModels().ajaxQueue(b)}},{html:o("Delete datasets"),func:function(){var b=d.HistoryDatasetAssociation.prototype.delete;a.getSelectedModels().ajaxQueue(b)}},{html:o("Undelete datasets"),func:function(){var b=d.HistoryDatasetAssociation.prototype.undelete;a.getSelectedModels().ajaxQueue(b)}}];return a.purgeAllowed&&b.push({html:o("Permanently delete datasets"),func:function(){if(confirm(o("This will permanently remove the data in your datasets. Are you sure?"))){var b=d.HistoryDatasetAssociation.prototype.purge;a.getSelectedModels().ajaxQueue(b)}}}),b=b.concat(a._collectionActions())},_collectionActions:function(){var a=this;return[{html:o("Build Dataset List"),func:function(){i.createListCollection(a.getSelectedModels()).done(function(){a.model.refresh()})}},{html:o("Build Dataset Pair"),func:function(){j.createPairCollection(a.getSelectedModels()).done(function(){a.model.refresh()})}},{html:o("Build List of Dataset Pairs"),func:function(){k.createListOfPairsCollection(a.getSelectedModels()).done(function(){a.model.refresh()})}}]},_getItemViewOptions:function(a){var b=p.prototype._getItemViewOptions.call(this,a);return _.extend(b,{purgeAllowed:this.purgeAllowed,tagsEditorShown:this.tagsEditor&&!this.tagsEditor.hidden,annotationEditorShown:this.annotationEditor&&!this.annotationEditor.hidden}),b},_handleHdaDeletionChange:function(a){var b=this.model.get("contents_shown");a.get("deleted")?(b.deleted+=1,this.showDeleted?b.shown-=1:this.removeItemView(a)):(b.deleted-=1,this.showDeleted||(b.shown-=1)),this.model.set("contents_shown",b),this._renderCounts()},_handleHdaVisibleChange:function(a){var b=this.model.get("contents_shown");a.hidden()?(b.hidden+=1,this.showHidden?b.shown-=1:this.removeItemView(a)):(b.hidden-=1,this.showHidden||(b.shown-=1)),this.model.set("contents_shown",b),this._renderCounts()},toggleHDATagEditors:function(a,b){_.each(this.views,function(c){c.tagsEditor&&c.tagsEditor.toggle(a,b)})},toggleHDAAnnotationEditors:function(a,b){_.each(this.views,function(c){c.annotationEditor&&c.annotationEditor.toggle(a,b)})},events:_.extend(_.clone(p.prototype.events),{"click .show-selectors-btn":"toggleSelectors","click .toggle-deleted-link":function(){this.toggleShowDeleted()},"click .toggle-hidden-link":function(){this.toggleShowHidden()}}),updateHistoryDiskSize:function(){this.$(".history-size").text(this.model.get("nice_size"))},dropTargetOn:function(){if(this.dropTarget)return this;this.dropTarget=!0;var a={dragenter:_.bind(this.dragenter,this),dragover:_.bind(this.dragover,this),dragleave:_.bind(this.dragleave,this),drop:_.bind(this.drop,this)},b=this._renderDropTarget();this.$list().before([this._renderDropTargetHelp(),b]);for(var c in a)a.hasOwnProperty(c)&&b.on(c,a[c]);return this},_renderDropTarget:function(){return this.$(".history-drop-target").remove(),$("<div/>").addClass("history-drop-target").css({height:"64px",margin:"0px 10px 10px 10px",border:"1px dashed black","border-radius":"3px"})},_renderDropTargetHelp:function(){return this.$(".history-drop-target-help").remove(),$("<div/>").addClass("history-drop-target-help").css({margin:"10px 10px 4px 10px",color:"grey","font-size":"80%","font-style":"italic"}).text(o("Drag datasets here to copy them to the current history"))},dropTargetOff:function(){if(!this.dropTarget)return this;this.dropTarget=!1;var a=this.$(".history-drop-target").get(0);for(var b in this._dropHandlers)this._dropHandlers.hasOwnProperty(b)&&a.off(b,this._dropHandlers[b]);return this.$(".history-drop-target").remove(),this.$(".history-drop-target-help").remove(),this},dropTargetToggle:function(){return this.dropTarget?this.dropTargetOff():this.dropTargetOn(),this},dragenter:function(a){a.preventDefault(),a.stopPropagation(),this.$(".history-drop-target").css("border","2px solid black")},dragover:function(a){a.preventDefault(),a.stopPropagation()},dragleave:function(a){a.preventDefault(),a.stopPropagation(),this.$(".history-drop-target").css("border","1px dashed black")},drop:function(a){a.preventDefault();var b=a.originalEvent.dataTransfer;b.dropEffect="move";var c=this,d=b.getData("text");try{d=JSON.parse(d)}catch(e){this.warn("error parsing JSON from drop:",d)}return this.trigger("droptarget:drop",a,d,c),!1},dataDropped:function(a){var b=this;return _.isObject(a)&&"HistoryDatasetAssociation"===a.model_class&&a.id?b.model.contents.copy(a.id):jQuery.when()},toString:function(){return"HistoryViewEdit("+(this.model?this.model.get("name"):"")+")"}});return q.prototype.templates=function(){var a=n.wrapTemplate(["<% var shown = Math.max( view.views.length, history.contents_shown.shown ) %>","<% if( shown ){ %><%- shown %> ",o("shown"),"<% } %>","<% if( history.contents_shown.deleted ){ %>","<% if( view.showDeleted ){ %>",', <a class="toggle-deleted-link" href="javascript:void(0);">',o("hide deleted"),"</a>","<% } else { %>",', <%- history.contents_shown.deleted %> <a class="toggle-deleted-link" href="javascript:void(0);">',o("deleted"),"</a>","<% } %>","<% } else { %>",'<span class="toggle-deleted-link"></span>',"<% } %>","<% if( history.contents_shown.hidden ){ %>","<% if( view.showHidden ){ %>",', <a class="toggle-hidden-link" href="javascript:void(0);">',o("hide hidden"),"</a>","<% } else { %>",', <%- history.contents_shown.hidden %> <a class="toggle-hidden-link" href="javascript:void(0);">',o("hidden"),"</a>","<% } %>","<% } else { %>",'<span class="toggle-hidden-link"></span>',"<% } %>"],"history");return _.extend(_.clone(p.prototype.templates),{counts:a})}(),{HistoryViewEdit:q}});
//# sourceMappingURL=../../../maps/mvc/history/history-view-edit.js.map