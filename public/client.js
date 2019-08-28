var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function install() {
  let backupid = document.getElementById('backupid').value;
  let guildid = location.href.split('/info/')[1];
  let x = confirm('Are you sure you want to clear the current guild data?');
  if (!x) return;
  var client = new HttpClient();
  client.get(`/api/install/${encodeURIComponent(guildid)}?id=${encodeURIComponent(backupid)}&tokens=${encodeURIComponent(localStorage.tokens)}`, function(response) {
    response = JSON.parse(response);
    console.log(response);
    if (response.error) alert(response.error)
    else alert(response.result);
  });
}


function backup() {
  let guildid = location.href.split('/info/')[1];
  let x = confirm('Are you sure you want to clear overwrite any existing backups?');
  if (!x) return;
  var client = new HttpClient();
  client.get(`/api/backup/${encodeURIComponent(guildid)}?tokens=${encodeURIComponent(localStorage.tokens)}`, function(response) {
    response = JSON.parse(response);
    console.log(response);
    if (response.error) alert(response.error)
    else alert(response.result);
  });
}

var justChanged = false;

var style = (function (style) {
    var sheet = document.head.appendChild(style).sheet;
    return function (selector, css) {
        var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
            return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
        }).join(";");
        sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
    };
})(document.createElement("style"));


document.body.onload = async function() {
  
  let user = localStorage.getItem('user');
  if (!user) {
    document.getElementById('main').style.display = "none";
    document.getElementById('login').style.display = "block";
  }
  if (location.href.includes('info')) {
    document.getElementById('content').style.display = "none";
    let guildid = location.href.split('/info/')[1];
    var client = new HttpClient();
    client.get(`/api/guild/${encodeURIComponent(guildid)}`, function(response) {
      response = JSON.parse(response);
      if (response.result === false) {
        document.getElementById('content').style.display = "block";
        document.getElementById('splits').style.display = "none";
        document.getElementById('invite-btn').href = `/api/invite?id=${guildid}`
        document.getElementById('invite').style.display = "block";
      }
    })
    
    
    var client2 = new HttpClient();
    client2.get(`/api/guildinfo/${encodeURIComponent(guildid)}?tokens=${encodeURIComponent(localStorage.tokens)}`, function(response) {
      response = JSON.parse(response);
      document.getElementById('content').style.display = "block";
      let main = document.getElementById('previous');
      main.innerHTML = "";
      if (response.error) {
        if (response.error === "You don't have enough perms to view backups.") document.getElementById('form').innerHTML = `<h2>Error</h2><p>You need <code>Manager Server</code> permissions to edit this server.</p>`
        return main.innerHTML = response.error
      }
      
      if (response.iconURL) {
        let img = document.createElement('img');
        img.src = response.iconURL;
        img.classList.add('servericon');
        main.appendChild(img);
      }
      
      let h3 = document.createElement('h3');
      h3.innerHTML = response.name;
      main.appendChild(h3);
      
      let channels = document.createElement('div');
      main.appendChild(channels)
      
      let dropdown = document.createElement('span');
      dropdown.innerHTML = 'Channels <i class="fa fa-chevron-down" aria-hidden="true"></i>';
      dropdown.classList.add('ch-dropdown');
      channels.appendChild(dropdown)
      dropdown.onclick = function() {
        let first = true
        for (let child of channels.children) {
          if (first) first = false;
          else {
            child.style.display = child.style.display === "none" ? "block" : "none";
          }
        }
      }
      for (let channel of response.channels.filter(x => x.type == "category")) {
        let category = document.createElement('div');
        category.classList.add('category', "channel");
        category.innerHTML = channel.name;
        for (let minic of response.channels.filter(x => x.parentID !== null && x.parentID == channel.id)) {
          let ch = document.createElement('div');
          ch.innerHTML = `# ${minic.name}`;
          ch.classList.add('mini', "channel");
          category.appendChild(ch);
        }
        channels.appendChild(category);
      }
      for (let minic of response.channels.filter(x => x.parentID === null && x.type !== "category")) {
        let ch = document.createElement('div');
        ch.classList.add('independant', "channel");
        ch.innerHTML = `#${minic.name}`;
        channels.appendChild(ch);
      }
      dropdown.click();
      
      
      let roles = document.createElement('div');
      main.appendChild(roles);
      dropdown = document.createElement('span');
      dropdown.innerHTML = 'Roles <i class="fa fa-chevron-down" aria-hidden="true"></i>';
      dropdown.classList.add('ch-dropdown');
      roles.appendChild(dropdown)
      dropdown.onclick = function() {
        let first = true
        for (let child of roles.children) {
          if (first) first = false;
          else {
            child.style.display = child.style.display === "none" ? "block" : "none";
          }
        }
      }
      for (let role of response.roles) {
        let r = document.createElement('div');
        r.classList.add('role');
        r.style.color = `#${role.color.toString(16)}`;
        if (role.name.startsWith('@')) r.innerHTML = role.name;
        else r.innerHTML = `@${role.name}`;
        roles.appendChild(r);
      }
      dropdown.click();
      
      
      
      let emojis = document.createElement('div');
      main.appendChild(emojis);
      dropdown = document.createElement('span');
      dropdown.innerHTML = 'Emojis <i class="fa fa-chevron-down" aria-hidden="true"></i>';
      dropdown.classList.add('ch-dropdown');
      emojis.appendChild(dropdown)
      dropdown.onclick = function() {
        let first = true
        for (let child of emojis.children) {
          if (first) first = false;
          else {
            child.style.display = child.style.display === "none" ? "block" : "none";
          }
        }
      }
      for (let em of response.emojis) {
        let e = document.createElement('div');
        e.classList.add('emoji');
        
        let i = document.createElement('img');
        i.classList.add('emoji-img');
        i.src = em.url;
        e.appendChild(i);
        
        let sp = document.createElement('span');
        sp.innerHTML = `:${em.name}:`;
        e.appendChild(sp)
        
        emojis.appendChild(e);
      }
      dropdown.click();
    });
  };
  
  user = JSON.parse(user);
  
  if (user) {
    document.getElementById('username').innerHTML = user.username;
    document.getElementById('discrim').innerHTML = "#" + user.discriminator;
    document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }
  
  document.getElementById('login-btn').onmouseover = function() {
    document.getElementById('login-img').src = "https://discordapp.com/assets/28174a34e77bb5e5310ced9f95cb480b.png";
  }
  document.getElementById('login-btn').onmouseout = function() {
    document.getElementById('login-img').src = "https://cdn.discordapp.com/attachments/489141650619367434/508286547854884865/discord_greyple.png";
  }
  if (document.getElementById('invite-btn')) {
    document.getElementById('invite-btn').onmouseover = function() {
      document.getElementById('invite-img').src = "https://discordapp.com/assets/28174a34e77bb5e5310ced9f95cb480b.png";
    }
    document.getElementById('invite-btn').onmouseout = function() {
      document.getElementById('invite-img').src = "https://cdn.discordapp.com/attachments/489141650619367434/508286547854884865/discord_greyple.png";
    }
  }
  

  if (document.getElementById('settings')) {
    document.body.onclick = function() {
      let o = document.getElementById('logout')
      if (o.classList.contains('see') && !justChanged) {
        o.classList.remove('see');
      }
    }
    document.getElementById('settings').onclick = function() {
      let o = document.getElementById('logout');
      if (o.classList.contains('see')) o.classList.remove('see');
      else {
        o.classList.add('see');
        justChanged = true;
        setTimeout(() => {
          justChanged = false
        }, 5)
      }
    }
  };
  
  //Sidebar
  
  let span = document.getElementById('my-ones');
  
  var client = new HttpClient();
  client.get(`/api/info?tokens=${encodeURIComponent(localStorage.tokens)}`, function(response) {
    response = JSON.parse(response);
    console.log(response);
    if (response.message && response.message === "You are being rate limited.") {
      return setTimeout(() => {
        location.reload()
      }, 2000)
    }
    if (response.message && response.message === "401: Unauthorized") return location.href = `/api/code?tokens=${encodeURIComponent(localStorage.tokens)}`
    if (response.error) location.href = `/api/code?tokens=${encodeURIComponent(localStorage.getItem('tokens'))}`
    response.forEach(req => {
      let n = document.createElement('li');
      let a = document.createElement('a');
      a.href = `/info/${req.id}`;
      
      if (!req.icon) {
        let rgx = /([ .,\/#!$%\^&\*;:{}=\-_`~()])/g
        let initials = req.name.split(rgx).map(x => x.charAt(0)).join('');
        n.innerHTML = initials;
      }
      
      n.style.backgroundImage = `url('${req.icon ? `https://cdn.discordapp.com/icons/${req.id}/${req.icon}.png` : ""}')`;
      n.style.backgroundSize = "contain"
      a.appendChild(n);
      span.appendChild(a);
      
      let span2 = document.createElement('span');
      span2.classList.add('servername');
      span2.innerHTML = req.name;
      span2.style.top = offset(n).top + 17 + "px";
      span2.style.left = offset(n).left + 70 + "px";
      n.appendChild(span2);
      
      if (location.href.includes(req.id)) {
        a.classList.add('activer');
        style('.activer:before', {
          top: `${n.getBoundingClientRect().y}px`,
          left: `${n.getBoundingClientRect().x - 57}px`
        })
      }
      
      n.onmouseover = function() {
        span2.style.top = n.getBoundingClientRect().y + 10 + "px";
        span2.style.left = n.getBoundingClientRect().x + 70 + "px";
      }
    })
  });
  
}