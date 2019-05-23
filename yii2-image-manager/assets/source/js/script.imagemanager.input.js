var imageManagerInput = {
	baseUrl: null,
	//language
	message: null,
	manageMode: null,
	//init imageManagerInput
	init: function(){
		//create modal
		imageManagerInput.initModal();
	},
	//creat image Manager modal
	initModal: function(){
		//check if modal not jet exists
		if($("#modal-imagemanager").length === 0){
			//set html modal in var
			var sModalHtml = '<div tabindex="-1" role="dialog" class="fade modal" id="modal-imagemanager">';
				sModalHtml += '<div class="modal-dialog modal-lg">';
					sModalHtml += '<div class="modal-content">';
						sModalHtml += '<div class="modal-header">';
							sModalHtml += '<button aria-hidden="true" data-dismiss="modal" class="close" type="button">&times;</button>';
							sModalHtml += '<h4>Image manager</h4>';
							//sModalHtml += '<ul id="modal-tab" class="nav nav-tabs"><li class="active"><a>Images</a></li><li><a>Video</a></li></ul>';
						sModalHtml += '</div>';
						sModalHtml += '<div class="modal-body">';
							sModalHtml += '<iframe id="iframe-image"></iframe>';
							//sModalHtml += '<iframe src="#" id="iframe-video"></iframe>';
						sModalHtml += '</div>';
					sModalHtml += '</div>';
				sModalHtml += '</div>';
			sModalHtml += '</div>';
			//prepend data to body
			$('body').prepend(sModalHtml);
		}
	},
	//open media manager modal
	openModal: function(inputId, aspectRatio, cropViewMode, multi, manageMode){
		//get selected item
		var iImageId = $("#"+inputId).val();
		var srcImageIdQueryString = "";
		if(iImageId !== ""){
			srcImageIdQueryString = "&image-id="+iImageId;
		}
		//create iframe url
		var queryStringStartCharacter = ((imageManagerInput.baseUrl).indexOf('?') == -1) ? '?' : '&';
		var imageManagerUrl = imageManagerInput.baseUrl+queryStringStartCharacter+"view-mode=iframe&input-id="+inputId+"&aspect-ratio="+aspectRatio+"&crop-view-mode="+cropViewMode+srcImageIdQueryString+"&multi="+multi+"&manage-mode="+manageMode;
		//set iframe path
		$("#modal-imagemanager #iframe-image").attr("src",imageManagerUrl);
                //set translation title for modal header
                $("#modal-imagemanager .modal-dialog .modal-header h4").text(imageManagerInput.message.imageManager); 
		//open modal
		$("#modal-imagemanager").modal("show");
	},
	//close media manager modal
	closeModal: function(){
		$("#modal-imagemanager").modal("hide");
	},
	//delete picked image
	deletePickedImage: function(inputId, imageId){
		//remove value of the input field
		var sFieldId = inputId;
		var sFieldNameId = sFieldId+"_name";
		var sImagePreviewId = sFieldId+"_image";
		var bShowConfirm = JSON.parse($(".delete-selected-image[data-input-id='"+inputId+"']").data("show-delete-confirm"));
		//show warning if bShowConfirm == true
		if(bShowConfirm){
			if(confirm(imageManagerInput.message.detachWarningMessage) == false){
				return false;
			}
		}

		if($('.open-modal-imagemanager[data-input-id="'+inputId+'"]').data('multiple') == 1){
			var idValue = $('#'+sFieldId).val();
			var nameValue = $('#'+sFieldNameId).val();

			var nameArr = nameValue.split(',');
			var index = $(".delete-selected-image[data-input-id='"+inputId+"'][data-image-id='"+imageId+"']").parents('.image-child').index();
			nameArr.splice(index,1);
			var nameString = "";
			for($i = 0; $i < nameArr.length; $i ++){
				nameString += nameArr.length != $i + 1 ? nameArr[$i] + ',' : nameArr[$i];
			}
			var idArr = idValue.split(',');
			idArr.splice(index,1);

			$('#'+sFieldId).val(idArr);
			$('#'+sFieldNameId).val(nameString);

			var parent = $(".delete-selected-image[data-input-id='"+inputId+"']").parents('.image-wrapper');
			var childs_lth = parent.children().length;
			if(childs_lth > 1){
				$(".delete-selected-image[data-input-id='"+inputId+"'][data-image-id='"+imageId+"']").parents('.image-wrapper').find('.image-child').eq(index).remove();
			}
			else{
				$(".delete-selected-image[data-input-id='"+inputId+"']").parents('.image-wrapper').addClass('hide');
			}
		}
		else{
			$('#'+sFieldId).val("");
			$('#'+sFieldNameId).val("");
			$('#'+sImagePreviewId).attr("src","").parents('.image-wrapper').addClass('hide');
			$(".delete-selected-image[data-input-id='"+inputId+"']").addClass("hide");
		}
		//trigger change
		$('#'+sFieldId).trigger("change");
	}
};

$(document).ready(function () {
	//init Image manage
	imageManagerInput.init();
	
	//open media manager modal
	$(document).on("click", ".open-modal-imagemanager", function () {
		var aspectRatio = $(this).data("aspect-ratio");
		var cropViewMode = $(this).data("crop-view-mode");
		var inputId = $(this).data("input-id");
		var multi = $(this).data('multiple');
		var manageMode = $(this).data('manage-mode');
		//open selector id
		imageManagerInput.openModal(inputId, aspectRatio, cropViewMode, multi, manageMode);
	});	
	
	//delete picked image
	$(document).on("click", ".delete-selected-image", function () {
		var inputId = $(this).data("input-id");
		var imageId = $(this).data('image-id');

		//open selector id
		imageManagerInput.deletePickedImage(inputId, imageId);
	});	
});