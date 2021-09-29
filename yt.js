//list of channels I want to avoid watching

var channel_in_sight, channels_to_avoid;

var keypressed = {};
function load_channels(){
	//runs everytime check() is called, which runs each time the url updates, or if you open youtube.
	//in case the extension was used previously, then first retrieve that data
	if (localStorage['channels_chrome_extension']){
		channels_to_avoid = JSON.parse(localStorage['channels_chrome_extension']);
	}
	else{
		//put some default channels, if necessary. localStorage gets cleared when you clear history
		channels_to_avoid = [];
	}
	localStorage['channels_chrome_extension'] = JSON.stringify(channels_to_avoid);
}

function get_channel_in_sight(){
	meta_div = document.getElementsByTagName('div')
	for (j=0; j<meta_div.length; j++){
		if (meta_div[j].id == "upload-info"){//there are two such divs and only one contains a hyperlink, the other is dummy
			if (meta_div[j].getElementsByTagName('a').length != 0){
				console.log(meta_div[j].getElementsByTagName('a')[0].text)
				return meta_div[j].getElementsByTagName('a')[0].text;
			}
		}
	}
}

function add_channel(){
	channel_in_sight = get_channel_in_sight();
	channels_to_avoid = JSON.parse(localStorage['channels_chrome_extension']);
	channels_to_avoid.push(channel_in_sight);
	localStorage['channels_chrome_extension'] = JSON.stringify(channels_to_avoid);
}

function remove_vids_home(){//the home page uses a different tag, but the same tag is visible "behind" the top layer while
	//watching(because miniplayer?), so two different functions
	//scroll and load some extra videos and then scroll back to where we were
	h = window.scrollY
	var scrollingElement = (document.scrollingElement || document.body);
	window.scrollTo(0, scrollingElement.scrollHeight);
	videos = document.getElementsByTagName('ytd-rich-item-renderer');
	//alert(videos.length);
	for(i = 0; i<videos.length; i++){
		video = videos[i];
		divs = video.getElementsByTagName('div');
		for(j=0; j<divs.length; j++){
			if(divs[j]['id'] == 'text-container'){
				//console.log(divs[j].innerText+'home');
				if(channels_to_avoid.includes(divs[j].innerText)){
					console.log(divs[j].innerText+" REMOVED");
					video.parentNode.removeChild(video);
				}
			}
		}
	}
	window.scrollTo(0, h);
}

function remove_vids_watch(){
	//some loading thing that needs to be removed, i don't quite understand what it inspect
	//but this works, basically delete that element, and only one element needs to be removed
	//else we don't get enough videos on the "watch next" panel
	bummer = document.getElementsByClassName('style-scope ytd-watch-next-secondary-results-renderer');
	for(i=0; i<bummer.length; i++){
		if(bummer[i].getElementsByTagName('div')[0]){
			if (bummer[i].getElementsByTagName('div')[0].id == 'ghost-cards'){
				console.log(bummer[i]);
				bummer[i].parentNode.removeChild(bummer[i]);}
				break;
			}
	}

	videos = document.getElementsByTagName('ytd-compact-video-renderer');
	//alert(videos.length);
	for(i = 0; i<videos.length; i++){
		video = videos[i];
		divs = video.getElementsByTagName('div');
		for(j=0; j<divs.length; j++){
			if(divs[j]['id'] == 'text-container'){
				// console.log(divs[j].innerText);
				if(channels_to_avoid.includes(divs[j].innerText)){
					console.log(divs[j].innerText+" REMOVED");
					video.parentNode.removeChild(video)
				}
			}
		}
	}

}

function yt_control(){

	//channel name is under a div with id text-container and class as below

	remove_vids_watch();

	channel_in_sight = get_channel_in_sight();

	if (channels_to_avoid.includes(channel_in_sight)){
		a = Math.floor(Math.random()*10000)
		console.log(a)
		open("https://xkcd.com/"+a, "_self")
	}
}

function check(){
	//load channel list from localStorage
	load_channels();
	channels_to_avoid = JSON.parse(localStorage['channels_chrome_extension']);
	var d = new Date();
	if (d.getHours() >= 9 && d.getHours() <= 18){//disable youtube between 9 am and 6 pm
		alert("YouTube has been disabled at this hour. You will be redirected.")
		open("https://xkcd.com/", "_self")
	}//not ready for this yet?

	if(location.href == 'https://www.youtube.com/' || location.href == 'http://www.youtube.com/'){
		document.onload = remove_vids_home();
		document.onscroll = remove_vids_home;
	}

	if(location.href.split('.')[1] == "youtube" && location.href.split('/')[3].substring(0, 5) == "watch"){
		document.onload = setTimeout(yt_control, 2000)//wait a little before redirect etc
		document.onscroll = remove_vids_watch;
		//console.log(location.href)
	}
}

//this is brilliant. so on recieving a message from the background script, i can call a function in the content script
//i just run check once the tab is updated
chrome.runtime.onMessage.addListener(function(message){
	console.log(location.href)
	check()
})

document.addEventListener('keydown', (event) =>{
	keypressed[event.key] = true;
	if (keypressed['Shift'] == true && event.key == 'V'){
		//alert has a character limit
		console.log(JSON.parse(localStorage['channels_chrome_extension']).toString().replaceAll(',', '\n'));
	}
	else if (keypressed['Shift'] == true && event.key == 'R'){
		channel_to_remove = prompt("Enter channel to remove (case sensitive):");
		channels_to_avoid = JSON.parse(localStorage['channels_chrome_extension'])
		channels_to_avoid.pop(channel_to_remove);
		localStorage['channels_chrome_extension'] = JSON.stringify(channels_to_avoid);
	}

	if(location.href.split('.')[1] == "youtube" && location.href.split('/')[3].substring(0, 5) == "watch"){
		if (keypressed['Shift'] == true && event.key == 'A'){
			add_channel();
		}
	}
});

document.addEventListener('keyup', (event)=>{
	delete keypressed[event.key];
})

check()
