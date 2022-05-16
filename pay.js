var progressTimer;

if (window.jQuery) { 
    var complete = 0;
    var statusText = 'Waiting payment...'
    function apirone_query(){
    email = $('input[name="email"]')[0].value;
    if (!complete && email){
    url = $('input[name="url"]')[0].value;
    email = $('input[name="email"]')[0].value;

    get_query='/maybepaid?url='+url+'&mail='+email;
    jQuery.ajax({
    url: get_query,             // указываем URL и
    dataType : "text",                     // тип загружаемых данных
    success: function (data, textStatus) { // вешаем свой обработчик на функцию success
        
        data = JSON.parse(data);    
        //console.log(data);
        if (data.Status == 'complete') {
            complete = 1; 
            clearTimeout(progressTimer);
            $(".with-uncomfirmed, .uncomfirmed").empty();
            statusText = "Payment complete";
        }
        if (data.Status == 'innetwork') {
            innetwork = 1;
            complete = 0;
            $(".with-uncomfirmed").text('(with uncomfirmed)');
            statusText = "Transaction in network (income amount: "+ data.innetwork_amount +" BTC)";
        }
        if (data.Status == 'waiting') {
            complete = 0;
            $(".with-uncomfirmed, .uncomfirmed").empty();
            statusText = "Waiting payment...";
        }
        if (!$("div").is(".last_transaction") && data.last_transaction && data.Status != 'innetwork'){
            $(".insertion").empty();
            $(".insertion").prepend('<small>Last transaction: <strong class="last_transaction">'+ data.last_transaction +'</strong></small><br>');
        }
        if ($("div").is(".last_transaction")){ $( ".last_transaction" ).text(data.last_transaction); }
        $( ".last_transaction" ).text(data.last_transaction);
        $( ".arrived" ).text(data.arrived_amount);
        remains = data.remains_to_pay - data.innetwork_amount;
        remains = remains.toFixed(8);
        if( remains < 0 ) remains = 0;
        $( ".remains" ).text(remains);
        $( ".status" ).text(statusText);
        complete_block = '<div class="col-lg-12 complete-block"><div class="alert alert-success" role="alert"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Payment done. Order finished. Please open email to get link for download.</div><p align="center"><a href="/get/' +url+ '/' + data.hash +'" target="_blank"><i class="fa fa-link" aria-hidden="true"></i> Download page</a></p><p align="center" class="resend-email"><a class="resend" style="cursor: pointer;"><i class="fa fa-refresh" aria-hidden="true"></i> Re-send email again.</a></p></div>';
 
        if (!$("div").is(".complete-block") && complete){ $( ".billing-block" ).after(complete_block); }
        
    } ,
    error: function(xhr, ajaxOptions, thrownError){
      //jQuery( ".apirone_result" ).html( '<strong>Waiting for payment...</strong>' );
    }
    });
    }
    }
    var checking = setInterval(apirone_query, 12000);

}


$(document).on('click', ".resend", function () {
    url = $('input[name="url"]')[0].value;
    email = $('input[name="email"]')[0].value;
    get_query='/maybepaid?url='+url+'&mail='+email+'&resend=true';
    jQuery( ".resend-email" ).html('<div class="alert alert-info">Please wait. Email sending...</div>');
    jQuery.ajax({
    url: get_query,             // указываем URL и
    dataType : "text",                     // тип загружаемых данных
    success: function (data, textStatus) { // вешаем свой обработчик на функцию success
        jQuery( ".resend-email" ).html('<div class="alert alert-success">Thank You. E-mail sent.</div>');
    }
    });
    return false;
});

function updateProgress(percentage, timeDiff) {
    $('#pbar_innerdiv').css("width", percentage + "%");
    $('#pbar_innertext').text(toHHMMSS(timeDiff));
}

function toHHMMSS(time) {
    var sec_num = Math.floor(time/1E3); // don't forget the second param
    var minutes = Math.floor(sec_num / 60);
    var seconds = sec_num - (minutes * 60);
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    //console.log(minutes+':'+seconds);
    return minutes+' minutes '+seconds +' seconds remains to pay';
}


function animateUpdate() {
    var now = new Date();
    var timeDiff = finish.getTime() - now.getTime();
    var perc = Math.round((timeDiff/maxTime)*100);
      if (perc >= 0) {
       updateProgress(perc, timeDiff);
       progressTimer = setTimeout(animateUpdate, timeoutVal);
      } else {
          $(".wait").css('display', 'none');
          $(".time").css('display', 'block');
      }
}
