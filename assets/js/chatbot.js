// AnimeForYou — AI Chatbot "Aria" (Optimized with Fable 5 patterns)
(function(){
  var chatOpen=false, chatInit=false, messageHistory=[];

  function createChatbot(){
    if(chatInit)return;
    chatInit=true;

    // FAB button with pulse animation
    var fab=document.createElement('button');
    fab.className='chatbot-fab';
    fab.id='chatFab';
    fab.setAttribute('aria-label','Open chat assistant');
    fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    fab.onclick=toggleChat;
    document.body.appendChild(fab);

    // Chat window with accessibility
    var win=document.createElement('div');
    win.className='chatbot-window';
    win.id='chatWindow';
    win.setAttribute('role','dialog');
    win.setAttribute('aria-label','Chat with Aria');
    win.innerHTML='\
      <div class="chatbot-header">\
        <div class="chatbot-header-info">\
          <h3>Aria</h3>\
          <small style="color:var(--text-muted);font-size:0.7rem">AI Anime Assistant</small>\
        </div>\
        <button class="chatbot-close" onclick="window._ariaChat.toggleChat()" aria-label="Close chat">✕</button>\
      </div>\
      <div class="chatbot-messages" id="chatMessages" role="log" aria-live="polite"></div>\
      <div class="chatbot-input">\
        <input type="text" id="chatInput" placeholder="Ask me anything..." aria-label="Type your message" onkeydown="if(event.key===\'Enter\')window._ariaChat.send()" />\
        <button onclick="window._ariaChat.send()" aria-label="Send message">Send</button>\
      </div>';
    document.body.appendChild(win);

    // Welcome message - Fable 5 style: warm, concise, no over-formatting
    addBotMsg("Hey! I'm Aria, your anime assistant.\n\nI can help with recommendations, finding anime by genre, or navigating the site. What are you looking for?");
  }

  function toggleChat(){
    chatOpen=!chatOpen;
    var win=document.getElementById('chatWindow');
    var fab=document.getElementById('chatFab');
    if(chatOpen){
      win.classList.add('open');
      fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      document.getElementById('chatInput').focus();
    }else{
      win.classList.remove('open');
      fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="26" height="26"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  }

  function addBotMsg(text){
    var el=document.getElementById('chatMessages');
    var div=document.createElement('div');
    div.className='chat-msg bot';
    div.innerHTML=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    el.appendChild(div);
    el.scrollTop=el.scrollHeight;
  }

  function addUserMsg(text){
    var el=document.getElementById('chatMessages');
    var div=document.createElement('div');
    div.className='chat-msg user';
    div.textContent=text;
    el.appendChild(div);
    el.scrollTop=el.scrollHeight;
  }

  function showTyping(){
    var el=document.getElementById('chatMessages');
    var div=document.createElement('div');
    div.className='chat-msg typing';
    div.id='chatTyping';
    div.innerHTML='<div class="chat-typing"><span></span><span></span><span></span></div>';
    el.appendChild(div);
    el.scrollTop=el.scrollHeight;
  }

  function hideTyping(){
    var t=document.getElementById('chatTyping');
    if(t)t.remove();
  }

  function getResponse(input){
    var q=input.toLowerCase().trim();
    var animes=window.DataStore?DataStore.getList():[];

    // Fable 5 style: concise, warm, no excessive formatting
    // Site navigation
    if(q.match(/\b(home|main|首页)\b/)) return "Head to the homepage via the Home link in the nav bar.";
    if(q.match(/\b(browse|search|find|look)\b/)) return "Use the Browse page to search by title or filter by genre.";
    if(q.match(/\b(feature|what can)\b/)) return "Check the Features page to see what we offer.";
    if(q.match(/\b(about|who)\b/)) return "Visit the About page to learn more about us.";
    if(q.match(/\b(contact|support|help|report)\b/)) return "The Support page has our FAQ and contact form.";
    if(q.match(/\b(admin|dashboard|manage)\b/)) return "The Admin Panel lets you manage anime and episodes.";

    // Anime recommendations - Fable 5: factual, helpful, brief
    if(q.match(/\b(recommend|suggest|what should|good anime|best anime|top anime)\b/)){
      if(animes.length){
        var top=animes.sort(function(a,b){return(b.rating||0)-(a.rating||0)}).slice(0,3);
        var recs=top.map(function(a){return a.title+' ('+a.rating+'★) - '+(a.genre||'')}).join('\n');
        return "Top picks by rating:\n\n"+recs+"\n\nBrowse the full library for more.";
      }
      return "Check the Browse page to see everything sorted by rating.";
    }

    // Genre-based - Fable 5: direct answers, no unnecessary questions
    if(q.match(/\b(action)\b/)){
      var action=animes.filter(function(a){return(a.genre||'').toLowerCase().includes('action')}).slice(0,3);
      if(action.length) return "Action anime:\n\n"+action.map(function(a){return a.title+' ('+a.rating+'★)'}).join('\n');
      return "Browse and filter by Action genre.";
    }
    if(q.match(/\b(comedy|funny|humor)\b/)){
      var comedy=animes.filter(function(a){return(a.genre||'').toLowerCase().includes('comedy')}).slice(0,3);
      if(comedy.length) return "Comedy anime:\n\n"+comedy.map(function(a){return a.title+' ('+a.rating+'★)'}).join('\n');
      return "Browse and filter by Comedy genre.";
    }
    if(q.match(/\b(fantasy|magic|isekai)\b/)){
      var fantasy=animes.filter(function(a){return(a.genre||'').toLowerCase().includes('fantasy')}).slice(0,3);
      if(fantasy.length) return "Fantasy anime:\n\n"+fantasy.map(function(a){return a.title+' ('+a.rating+'★)'}).join('\n');
      return "Browse and filter by Fantasy genre.";
    }
    if(q.match(/\b(thriller|suspense|mystery)\b/)){
      var thriller=animes.filter(function(a){return(a.genre||'').toLowerCase().includes('thriller')}).slice(0,3);
      if(thriller.length) return "Thriller anime:\n\n"+thriller.map(function(a){return a.title+' ('+a.rating+'★)'}).join('\n');
      return "Browse and filter by Thriller genre.";
    }

    // How many anime
    if(q.match(/\b(how many|count|total|number)\b/)){
      return "We have "+animes.length+" anime in the library.";
    }

    // Download help - Fable 5: step-by-step, clear
    if(q.match(/\b(download|link|watch|stream)\b/)){
      return "To watch: Browse > click an anime > select episode > click Watch Now. To download: click Download on the episode page.";
    }

    // Konosuba specific
    if(q.match(/\b(konosuba)\b/)){
      return "Konosuba: A comedy isekai about Kazuma sent to a fantasy world with a useless goddess, a delusional crusader, and an explosion-obsessed wizard. Rating: 8.5★.";
    }

    // Greetings - Fable 5: warm, friendly
    if(q.match(/^(hi|hello|hey|yo|sup|hola|namaste|salam)/)){
      return "Hey! What are you looking for?";
    }

    // Thanks
    if(q.match(/\b(thanks|thank you|thx|ty)\b/)){
      return "Let me know if you need anything else.";
    }

    // Who are you
    if(q.match(/\b(who are you|what are you|your name)\b/)){
      return "I'm Aria, the AnimeForYou assistant. I help you find anime and navigate the site.";
    }

    // Help
    if(q.match(/\b(help|what can you)\b/)){
      return "I can help you find anime, get recommendations, navigate the site, or learn how to download. Just ask.";
    }

    // Fallback - Fable 5: helpful, suggest next steps
    var match=animes.filter(function(a){return(a.title||'').toLowerCase().includes(q)});
    if(match.length>0){
      var a=match[0];
      return a.title+'\n\n'+(a.description||'No description')+'\n\nRating: '+(a.rating||'N/A')+'★ | Genre: '+(a.genre||'N/A')+'\n\nWatch it: player.html?id='+a.id;
    }

    return "Try asking for recommendations, help finding anime by genre, or how to download.";
  }

  function send(){
    var input=document.getElementById('chatInput');
    var text=input.value.trim();
    if(!text)return;
    addUserMsg(text);
    input.value='';
    showTyping();
    setTimeout(function(){
      hideTyping();
      addBotMsg(getResponse(text));
    },600+Math.random()*800);
  }

  // Expose
  window._ariaChat={toggleChat:toggleChat,send:send};

  // Init on DOM ready
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',createChatbot);
  }else{
    createChatbot();
  }
})();