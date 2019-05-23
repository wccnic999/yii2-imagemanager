var imageManagerModule = {
	//params for input selector
	fieldId: null,
	cropRatio: null,
	cropViewMode: 1,
	defaultImageId: [],
	selectType: null, 
	//current selected image
	selectedImage: [],
	selectedActionImage: null,
	//language
	message: null,
	//init imageManager
	init: function(){
		//init cropper
		$('#module-imagemanager > .row .col-image-editor .image-cropper .image-wrapper img#image-cropper').cropper({
			viewMode: imageManagerModule.cropViewMode
		});
		
		//preselect image if image-id isset
		if(imageManagerModule.defaultImageId !== ""){
			var sFieldId = imageManagerModule.fieldId;
			var idValue = $('#'+sFieldId, window.parent.document).val();
			var idArr = idValue.split(',');
			imageManagerModule.reSelectImage(idArr);
			for(s in idArr){
				imageManagerModule.getDetails(idArr[s]);
			}
		}
		
		//set selected after pjax complete
		$('#pjax-mediamanager').on('pjax:complete', function() {
			if( imageManagerModule.selectedImage.length ){
				imageManagerModule.reSelectImage();
			}
		});
	},
	openPopup: function(){
		$('#popup-video').fadeIn('fast');
	},
	closePopup: function(){
		$('#popup-video').fadeOut('fast');
	},
	//filter result
	filterImageResult: function(searchTerm){
		//set new url
		var newUrl = window.queryStringParameter.set(window.location.href, "ImageManagerSearch[globalSearch]", searchTerm);
		//set pjax
		$.pjax({url: newUrl, container: "#pjax-mediamanager", push: false, replace: false, timeout: 5000, scrollTo:false});
	},	
	reSelectImage: function(idArr = []){
		var images = idArr.length ? idArr : imageManagerModule.selectedImage;
		for(s in images){
			if(idArr.length){
				$("#module-imagemanager .item-overview .item[data-key='"+images[s]+"']").toggleClass("selected");
			}
			else{
				$("#module-imagemanager .item-overview .item[data-key='"+images[s].id+"']").toggleClass("selected");
			}
		}
	},
	//select an image
	selectImage: function(id){
		var multi = imageManagerModule.multi;
		//set selected class
		if(multi == '1'){
			$("#module-imagemanager .item-overview .item[data-key='"+id+"']").toggleClass("selected");
			if($("#module-imagemanager .item-overview .item[data-key='"+id+"']").hasClass('selected')){
				imageManagerModule.getDetails(id);
			}
			else{
				imageManagerModule.removeDetails(id);
			}
		}
		else{
			$("#module-imagemanager .item-overview .item").removeClass("selected");
			$("#module-imagemanager .item-overview .item[data-key='"+id+"']").addClass("selected");
			
			if(imageManagerModule.selectedImage.length){
				imageManagerModule.removeDetails();
			}
			if($('#popup-video').length){
				var baseUrl = $('#baseUrl').html();
				var fileName = $('#module-imagemanager > .row').find('.item.selected').find('.filename').html();
				var fullFile = baseUrl + '/uploads/videos/' + fileName;
				$('#module-imagemanager > .row .col-options .download').attr('href',fullFile);
			}
			imageManagerModule.getDetails(id);
		}
	},
	//pick the selected image
	pickImage: function(){
		//switch between select type
		switch(imageManagerModule.selectType){
			//default widget selector
			case "input":
				//get id data
				var sFieldId = imageManagerModule.fieldId;
				var sFieldNameId = sFieldId+"_name";
				var sFieldImageId = sFieldId+"_image";

				var child = $('#'+sFieldImageId, window.parent.document).parents('.image-child');
				var parent = $('#'+sFieldImageId, window.parent.document).parents('.image-wrapper').removeClass('hide');
				parent.empty();
				var imageIdFieldVal = "";
				var nameFieldVal = "";
				for($i = 0; $i < imageManagerModule.selectedImage.length; $i++){
					const currentImage = imageManagerModule.selectedImage[$i];
					// var imageIdFieldVal = $('#'+sFieldId, window.parent.document).val() ? $('#'+sFieldId, window.parent.document).map(function(){ return $(this).val();}).get() : [];
					//  = $('#'+sFieldNameId, window.parent.document).val() ? $('#'+sFieldNameId, window.parent.document).val() : '';
					
					imageIdFieldVal += $i != imageManagerModule.selectedImage.length -1 ? currentImage.id+ ',' : currentImage.id;
					nameFieldVal += $i != imageManagerModule.selectedImage.length -1 ? currentImage.fileName+ ', ' : currentImage.fileName;
					child.find('img').attr('src',currentImage.image);
					child.removeClass('hide');
					child.find('.delete-selected-image').attr('data-image-id', currentImage.id).attr('data-image-name', currentImage.fileName).removeClass('hide');
					child.clone().appendTo(parent);
				}

				if(imageManagerModule.selectedImage.length === 0){
					imageIdFieldVal = '';
					nameFieldVal = '';
					parent.addClass('hide');
					child.addClass('hide');
					child.clone().appendTo(parent);
				}
				$('#'+sFieldId, window.parent.document).val(imageIdFieldVal).trigger('change');
				$('#'+sFieldNameId, window.parent.document).val(nameFieldVal).trigger('change');
				window.parent.imageManagerInput.closeModal();
				break;
			//CKEditor selector
			case "ckeditor":
			//TinyMCE Selector
			case "tinymce":
				//check if isset image
				if(imageManagerModule.selectedImage !== null){
					//call action by ajax
					$.ajax({
						url: imageManagerModule.baseUrl+"/get-original-image",
						type: "POST",
						data: {
							ImageManager_id: imageManagerModule.selectedImage.id,
							_csrf: $('meta[name=csrf-token]').prop('content')
						},
						dataType: "json",
						success: function (responseData, textStatus, jqXHR) {
							//set attributes for each selector
							if(imageManagerModule.selectType == "ckeditor"){
								var sField = window.queryStringParameter.get(window.location.href, "CKEditorFuncNum");
								window.top.opener.CKEDITOR.tools.callFunction(sField, responseData);
								window.self.close();
							}else if(imageManagerModule.selectType == "tinymce"){
								var sField = window.queryStringParameter.get(window.location.href, "tag_name");
								window.opener.document.getElementById(sField).value = responseData;
								window.close();
								window.opener.focus();								
							}
						},
						error: function (jqXHR, textStatus, errorThrown) {
							alert("Error: can't get item");
						}
					});
				}else{
					alert("Error: image can't picked");
				}
				break;
		}
		
		
	},
	//delete the selected image
	deleteSelectedImage: function(){
		//confirm message
		if(confirm(imageManagerModule.message.deleteMessage)){
			//close editor
			imageManagerModule.editor.close();
			//check if isset image
			if(imageManagerModule.selectedActionImage !== null){
				//call action by ajax
				$.ajax({
					url: imageManagerModule.baseUrl+"/delete",
					type: "POST",
					data: {
						ImageManager_id: imageManagerModule.selectedActionImage.id,
						_csrf: $('meta[name=csrf-token]').prop('content')
					},
					dataType: "json",
					success: function (responseData, textStatus, jqXHR) {
						console.log('hihi response', responseData);
						//check if delete is true
						if(responseData.delete === true){
							imageManagerModule.removeDetails(imageManagerModule.selectedActionImage.id);
							//delete item element
							$("#module-imagemanager .item-overview .item[data-key='"+imageManagerModule.selectedActionImage.id+"']").remove(); 
							//add hide class to info block
							$("#module-imagemanager .image-info").addClass("hide");
							//set selectedImage to null
							imageManagerModule.selectedActionImage = null;
							//close edit
						}else{
							alert("有商品或類別正使用這圖片／影片");
						}
					},
					error: function (jqXHR, textStatus, errorThrown) {
						// alert("Error: can't delete item");
						alert("有商品或類別正使用這圖片／影片");
					}
				});
			}else{
				alert("Error: image can't delete, no image isset set");
			}
		}
	},
	removeDetails: function(id = imageManagerModule.selectedImage[0].id) {
		var index = imageManagerModule.selectedImage.findIndex(function(o){
			return o.id === id;
	   })
	   if (index !== -1) imageManagerModule.selectedImage.splice(index, 1);
	},
	//get image details
	getDetails: function(id, pickAfterGetDetails){
		//set propertie if not set
		pickAfterGetDetails = pickAfterGetDetails !== undefined ? pickAfterGetDetails : false;
		//call action by ajax
		$.ajax({
			url: imageManagerModule.baseUrl+"/view",
			type: "POST",
			data: {
				ImageManager_id: id,
				_csrf: $('meta[name=csrf-token]').prop('content'),
				type: imageManagerModule.manageMode
			},
			dataType: "json",
			success: function (responseData, textStatus, jqXHR) {
				//set imageManagerModule.selectedImage property
				imageManagerModule.selectedImage.push(responseData);
				imageManagerModule.selectedActionImage = responseData;
				
				//if need to pick image?
				if(pickAfterGetDetails){
					imageManagerModule.pickImage();
				//else set data
				}else{
					//set text elements
					$("#module-imagemanager .image-info .fileName").text(responseData.fileName).attr("title",responseData.fileName);
					$("#module-imagemanager .image-info .created").text(responseData.created);
					$("#module-imagemanager .image-info .fileSize").text(responseData.fileSize);
					$("#module-imagemanager .image-info .dimensions .dimension-width").text(responseData.dimensionWidth);
					$("#module-imagemanager .image-info .dimensions .dimension-height").text(responseData.dimensionHeight);
					$("#module-imagemanager .image-info .thumbnail").html("<img src='"+responseData.image+"' alt='"+responseData.fileName+"'/>");
					//remove hide class
					$("#module-imagemanager .image-info").removeClass("hide");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alert("Can't view image. Error: "+jqXHR.responseText);
			}
		});
	},
	//upload file
	uploadSuccess: function(uploadResponse){
		console.log('uploaded', uploadResponse);
		//close editor
		imageManagerModule.editor.close();
		//reload pjax container
		$.pjax.reload('#pjax-mediamanager', {push: false, replace: false, timeout: 5000, scrollTo: false});
	},
	//editor functions
	editor: {
		//open editor block
		open: function(){
			//show editer / hide overview
			$("#module-imagemanager > .row .col-image-editor").show();
			$("#module-imagemanager > .row .col-overview").hide();
		},
		//close editor block
		close: function(){
			//show overview / hide editer
			$("#module-imagemanager > .row .col-overview").show();
			$("#module-imagemanager > .row .col-image-editor").hide();
		},
		//open cropper
		openCropper: function(){
			//check if isset image
			if(imageManagerModule.selectedActionImage !== null){
				//call action by ajax
				$.ajax({
					url: imageManagerModule.baseUrl+"/get-original-image",
					type: "POST",
					data: {
						ImageManager_id: imageManagerModule.selectedActionImage.id,
						_csrf: $('meta[name=csrf-token]').prop('content')
					},
					dataType: "json",
					success: function (responseData, textStatus, jqXHR) {
						//hide cropper
						$("#module-imagemanager > .row .col-image-cropper").css("visibility","hidden");
						//set image in cropper
						$('#module-imagemanager > .row .col-image-editor .image-cropper .image-wrapper img#image-cropper').one('built.cropper', function () {
							//show cropper
							$("#module-imagemanager > .row .col-image-cropper").css("visibility","visible");
						})
						.cropper('reset')
						.cropper('setAspectRatio', parseFloat(imageManagerModule.cropRatio))
						.cropper('replace', responseData);
						//open editor
						imageManagerModule.editor.open();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						alert("Error: can't get item");
					}
				});
			}else{
				alert("Error: image can't crop, no image isset set");
			}
		},
		//apply crop
		applyCrop: function(pickAfterCrop){
			//set propertie if not set
			pickAfterCrop = pickAfterCrop !== undefined ? pickAfterCrop : false;
			//check if isset image
			if(imageManagerModule.selectedActionImage !== null){
				//set image in cropper
				var oCropData = $('#module-imagemanager > .row .col-image-editor .image-cropper .image-wrapper img#image-cropper').cropper("getData");
				//call action by ajax
				$.ajax({
					url: imageManagerModule.baseUrl+"/crop",
					type: "POST",
					data: {
						ImageManager_id: imageManagerModule.selectedActionImage.id,
						CropData: oCropData,
						_csrf: $('meta[name=csrf-token]').prop('content')
					},
					dataType: "json",
					success: function (responseData, textStatus, jqXHR) {
						//set cropped image
						if(responseData !== null){
							//if pickAfterCrop is true? select directly else
							if(pickAfterCrop){
								imageManagerModule.removeDetails(imageManagerModule.selectedActionImage.id);
								imageManagerModule.getDetails(responseData, true);
							//else select the image only
							}else{
								//set new image
								//imageManagerModule.selectImage(responseData);
								//reload pjax container
								$.pjax.reload('#pjax-mediamanager', {push: false, replace: false, timeout: 5000, scrollTo: false});
							}
						}
						//close editor
						imageManagerModule.editor.close();
					},
					error: function (jqXHR, textStatus, errorThrown) {
						alert("Error: item is not cropped");
					}
				});
			}else{
				alert("Error: image can't crop, no image isset set");
			}
		},
	},
	download: function() {
		var baseUrl = $('#baseUrl').html();
		// var fileName = $('#module-imagemanager > .row').find('.item.selected').find('.filename').html();
		var fileName = imageManagerModule.selectedActionImage.fileName;

		var fullFile = baseUrl + '/uploads/videos/' + fileName;
		$('#module-imagemanager > .row .col-options .download').attr('href',fullFile);
	},
	// openLoading: function() {
	// 	$('#loading').fadeIn('fast');
	// }
};

$(document).ready(function () {
	//init Image manage
	var player;

	imageManagerModule.init();

	$(document).on('click', '#popup-video .popup-close', function(e) {
		player.pause();
		imageManagerModule.closePopup();
	})
	//on click select item (open view)
	// $(document).on('click', '#module-imagemanager .item-overview .popupVideo', function(e) {
		// e.stopPropagation();
		
		// var fileName = $(this).parents('.thumbnail').find('.filename').html();
		// var fullFile = $('#baseUrl').html() + '/uploads/videos/' + fileName;
		// $('#my-video').find('video').find('source').attr('src',fullFile);
		// player = videojs('my-video');
		// player.src({ src: fullFile});
		// player.load();
		// imageManagerModule.openPopup();
		// player.play();

		// player.on('ended',function(){
		// 	setTimeout(function(){
		// 		imageManagerModule.closePopup();
		// 	},500);
		// });
	// });
	$(document).on("click", "#module-imagemanager .item-overview .item", function (e){
		//get id
		var ImageManager_id = $(this).data("key");
		//select image
		imageManagerModule.selectImage(ImageManager_id);
	});
	//on click pick image
	$(document).on("click", "#module-imagemanager .image-info .pick-image-item", function (){
		imageManagerModule.pickImage();
		return false;
	});
	//on click delete call "delete"
	$(document).on("click", "#module-imagemanager .image-info .delete-image-item", function (){
		imageManagerModule.deleteSelectedImage();
		return false;
	});
	//on click crop call "crop"
	$(document).on("click", "#module-imagemanager .image-info .crop-image-item", function (){
		imageManagerModule.editor.openCropper();
		return false;
	});
	//on click apply crop
	$(document).on("click", "#module-imagemanager .image-cropper .apply-crop", function (){
		imageManagerModule.editor.applyCrop();	
		return false;
	});
	//on click apply crop
	$(document).on("click", "#module-imagemanager .image-cropper .apply-crop-select", function (){
		imageManagerModule.editor.applyCrop(true);	
		return false;
	});
	//on click cancel crop
	$(document).on("click", "#module-imagemanager .image-cropper .cancel-crop", function (){
		imageManagerModule.editor.close();	
		return false;
	});
	//on keyup change set filter
	$( document ).on("keyup change", "#input-mediamanager-search", function() {
		imageManagerModule.filterImageResult($(this).val());
	});
	$(document).on('click', "#module-imagemanager .image-info .preview-video", function(e){
		e.stopPropagation();
		
		var fileName = imageManagerModule.selectedActionImage.fileName;
		var fullFile = $('#baseUrl').html() + '/uploads/videos/' + fileName;
		$('#my-video').find('video').find('source').attr('src',fullFile);
		player = videojs('my-video');
		player.src({ src: fullFile});
		player.load();
		imageManagerModule.openPopup();
		player.play();

		player.on('ended',function(){
			setTimeout(function(){
				imageManagerModule.closePopup();
			},500);
		});
	});

	// $(document).on('click', "#module-imagemanager .pagination a", function() {
	// 	imageManagerModule.openLoading();
	// });

	$(document).on('click', "#module-imagemanager .image-info .download", function (){
		imageManagerModule.download();
		return false;
	});
});

/*
 * return new get param to url
 */
window.queryStringParameter = {
	get: function(uri, key){
		var reParam = new RegExp('(?:[\?&]|&amp;)' + key + '=([^&]+)', 'i');
		var match = uri.match(reParam);
		return (match && match.length > 1) ? match[1] : null;
	},
	set: function(uri, key, value){
		//replace brackets 
		var keyReplace = key.replace("[]", "").replace(/\[/g, "%5B").replace(/\]/g, "%5D");
		//replace data
		var re = new RegExp("([?&])" + keyReplace + "=.*?(&|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, '$1' + keyReplace + "=" + value + '$2');
		}
		else {
			return uri + separator + keyReplace + "=" + value;
		}
	}
};