(function(){function changelog(it
) {
var out='# '+(it.appName)+'\r\n';var arr1=it.tags;if(arr1){var value,index=-1,l1=arr1.length-1;while(index<l1){value=arr1[index+=1];out+='\r\n## Release '+(value.version)+'\r\n'+(value.message)+'\r\n';var arr2=value.commits.all;if(arr2){var commit,idx=-1,l2=arr2.length-1;while(idx<l2){commit=arr2[idx+=1];out+='\r\n- '+(commit.dateFormated)+' '+(commit.author_name)+': '+(commit.message)+' ';if(commit.body){out+='\r\n  ```\r\n  '+(commit.body)+'\r\n  ```';}} } } } return out;
}var itself=changelog, _encodeHTML=(function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {window.render=window.render||{};window.render['changelog']=itself;}}());