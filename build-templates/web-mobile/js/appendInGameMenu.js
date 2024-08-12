// appendInGameMenu.js

var LobbyConfig = {
    Scripts: ["appendJS.js"],
    UrlKey : "lobbyurl",
};

var AppendInGameMenu = {
    getUrl: function () {
        let params = new URLSearchParams(window.location.search);
        let url = params.get(LobbyConfig.UrlKey);
        if ( url != null ) return url;

        return new URL(window.location.href).origin + '/lobby/';
    },
    getJs: function () { return LobbyConfig.Scripts[0]; },

    append: async function () {
        let urlParams = new URLSearchParams(window.location.search);
        let url = this.getUrl();
        let js = this.getJs();
        let appendUrl = url + js;

        await new Promise((resolve, reject) => {
            var script = document.createElement("script");
            script.src = appendUrl;

            console.log("ClientLobby URL: " + appendUrl);

            script.onload = function () { appendJS.init(url); };
            document.head.appendChild(script);
        });
    },
};

// 改由遊戲呼叫
// AppendInGameMenu.append();
