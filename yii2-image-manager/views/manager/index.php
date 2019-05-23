<?php
use yii\helpers\Url;
use yii\helpers\Html;
use yii\widgets\ListView;
use yii\widgets\Pjax;
use kartik\file\FileInput;

$this->title = '圖片庫';
$this->registerCssFile('https://vjs.zencdn.net/7.4.1/video-js.css');

?>
<?php if($manageMode == 'video'){?>
<div id='popup-video'>
	<div id="baseUrl" class="hidden"><?=Url::base(true);?></div>
	<div class='popup-close'><?=Yii::t('imagemanager','Close Video');?></div>
	<div class='popup-content'>
		<video id='my-video' class='video-js' controls preload="none" width='100%' height='500' poster='' data-setup='{"src":"", "autoplay": false, "controls": true}'>
			<source src='http://vjs.zencdn.net/v/oceans.mp4' type='video/mp4'>
				<p class='vjs-no-js'>
				To view this video please enable JavaScript, and consider upgrading to a web browser that
				<a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
				</p>
		</video>
	</div>
</div>
<?php }?>
<div id="loading">
	<div class="mask"></div>
	<div class="loading-content">
		<div class="lds-ring">
			<div></div><div></div><div></div><div></div>
		</div>
	</div>
</div>
<div id="module-imagemanager" class="container-fluid <?=$selectType?>" data-viewMode="list" data-mediaType="<?=$manageMode;?>">
	<div class="row">
		<div class="col-xs-6 col-sm-10 col-image-editor">
			<div class="image-cropper">
				<div class="image-wrapper">
					<img id="image-cropper" />
				</div>
				<div class="action-buttons">
					<a class="btn btn-primary apply-crop">
						<i class="fa fa-crop"></i>
						<span class="hidden-xs"><?=Yii::t('imagemanager','Confirm crop')?></span>
					</a>
					<?php if($viewMode === "iframe"): ?>
					<a class="btn btn-primary apply-crop-select">
						<i class="fa fa-crop"></i>
						<span class="hidden-xs"><?=Yii::t('imagemanager','Confirm crop and select')?></span>
					</a>
					<?php endif; ?>
					<a class="btn btn-default cancel-crop">
						<i class="fa fa-undo"></i>
						<span class="hidden-xs"><?=Yii::t('imagemanager','Cancel')?></span>
					</a>
				</div>
			</div> 
		</div>
		<div class="col-xs-6 col-sm-10 col-overview">
			<?php Pjax::begin([
				'id'=>'pjax-mediamanager',
				'timeout'=>'5000'
			]); ?>    
			<?php if($manageMode == 'video'){
				echo ListView::widget([
					'dataProvider' => $dataProvider,
					'itemOptions' => ['class' => 'item img-thumbnail'],
					'layout' => "<div class='item-overview'>{items}</div> {pager}",
					'itemView' => function ($model, $key, $index, $widget) {
						return $this->render("_videoItem", ['model' => $model]);
				}]);
			}
			else
			{
			 	echo ListView::widget([
				'dataProvider' => $dataProvider,
				'itemOptions' => ['class' => 'item img-thumbnail'],
				'layout' => "<div class='item-overview'>{items}</div> {pager}",
				'itemView' => function ($model, $key, $index, $widget) {
					return $this->render("_item", ['model' => $model]);
					},
				]);
			} ?>
			<?php Pjax::end(); ?>
		</div>
		<div class="col-xs-6 col-sm-2 col-options">
			<div class="form-group">
				<?=Html::textInput('input-mediamanager-search', null, ['id'=>'input-mediamanager-search', 'class'=>'form-control', 'placeholder'=>Yii::t('imagemanager','Search').'...'])?>
			</div>

			<?php
				if (Yii::$app->controller->module->canUploadImage):
			?>
			<?=FileInput::widget([
				'name' => 'imagemanagerFiles[]',
				'id' => 'imagemanager-files',
				'options' => [
					'multiple' => true,
					'accept' => 'image/*,video/mp4,video/x-m4v,video/*'
				],
				'pluginOptions' => [
					'uploadUrl' => Url::to(['manager/upload']),
					'allowedFileExtensions' => ['jpg','jpeg','gif','png','mp4'], 
					'uploadAsync' => false,
					'showPreview' => false,
					'showRemove' => false,
					'showUpload' => false,
					'showCancel' => false,
					'browseClass' => 'btn btn-primary btn-block',
					'browseIcon' => '<i class="fa fa-upload"></i> ',
					'browseLabel' => Yii::t('imagemanager','Upload')
				],
				'pluginEvents' => [
					"filebatchselected" => "function(event, files){  $('.msg-invalid-file-extension').addClass('hide'); $(this).fileinput('upload'); }",
					"filebatchuploadsuccess" => "function(event, data, previewId, index) {
						imageManagerModule.uploadSuccess(data.jqXHR.responseJSON.imagemanagerFiles);
					}",
					"fileuploaderror" => "function(event, data) { 
						$('.msg-invalid-file-extension').removeClass('hide'); 
					}",
				],
			]) ?>

			<?php
				endif;
			?>

			<div class="image-info hide">
				<div class="thumbnail">
					<img src="#">
				</div>
				<?php if($manageMode !== 'video'): ?>
				<div class="edit-buttons">
					<a class="btn btn-primary btn-block crop-image-item">
						<i class="fa fa-crop"></i>
						<span class="hidden-xs"><?=Yii::t('imagemanager','Crop')?></span>
					</a>
				</div>
				<?php endif;?>
				<div class="details">
					<div class="fileName"></div>
					<div class="created"></div>
					<div class="fileSize"></div>
					<div class="dimensions"><span class="dimension-width"></span> &times; <span class="dimension-height"></span></div>
					<?php
						if (Yii::$app->controller->module->canRemoveImage):
					?>
						<a class="btn btn-xs btn-danger delete-image-item" ><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> <?=Yii::t('imagemanager','Delete')?></a>
					<?php
						endif;
					?>
				</div>
				<?php if($viewMode === "iframe"): ?>
				<a class="btn btn-primary btn-block pick-image-item"><?=Yii::t('imagemanager','Select')?></a> 
				<?php endif; ?>
				<?php if($manageMode === 'video'): ?>
				<a class="btn btn-primary btn-block preview-video"><?=Yii::t('imagemanager','Preview Video');?></a>
				<a class="btn btn-primary btn-block download" download><?=Yii::t('imagemanager','Download Video');?></a>
				<?php endif;?>
			</div>
		</div>  
	</div>
</div>  
<?php $this->registerJsFile('https://vjs.zencdn.net/7.4.1/video.js');?>