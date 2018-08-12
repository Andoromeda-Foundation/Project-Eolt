/**
 * Created by Dawn on 2018-08-12.
 */


function swap_music(id) {
    var oAudio= document.getElementById("audioId");
    var playEvent=document.getElementById(id);
    if(oAudio.paused){
        oAudio.play();
        $("#"+id).attr('src',"imges/pause.jpg");
    }else {
        oAudio.pause();
        $("#"+id).attr('src',"imges/play.jpg");
    }
}