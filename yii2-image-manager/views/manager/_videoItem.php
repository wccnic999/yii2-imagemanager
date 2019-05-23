
<?php 
$fileNameArr = explode('.',$model->fileName);
$fileName = $fileNameArr[0].'.mp4';
?>

<div class="thumbnail">
    <div class="popupVideo"><i class="fa fa-play-circle" aria-hidden="true"></i></div>
	<!-- <img src="<? //\Yii::$app->imagemanager->getImagePath($model->id, 300, 300)?>" alt="<?=$fileName?>"> -->
    <div class="filename"><?=$fileName?></div>
</div>
