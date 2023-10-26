class PlaybackPlan {
    constructor(path = "../shared/json/playback.json") {
        this.path = path;
    }

    async load() {
        return await $.getJSON(this.path)
            .fail(() => this.load());
    }
}

class Playback {
    PLAY = "play";
    PAUSE = "pause";

    constructor(element) {
        const tag = element.tag();
        if(tag == "button") {
            this.button = element;
            this.image = element.children("img");
        }
        else if(tag == "img") {
            this.button = element.parent("button");
            this.image = element;
        }
    }

    value(value = null) {
        if(value == null) { return this.button.val(); }
        return this.button.val(value);
    }

    #reverse(value) {
        if(value == this.PLAY) { return this.PAUSE; }
        else if(value == this.PAUSE) { return this.PLAY; }
    }

    state(value = null) {
        value = this.value(this.#reverse(value));
        return this.#reverse(value);
    }

    switch() {
        const state = this.state();
        this.value(state);
    }
}

const play = (child) => {
    const playbackPlan = new PlaybackPlan();
    playbackPlan.load().then((obj) => {
        const playbackButton = $("#playback-button");
        playback = new Playback(playbackButton);
        child(playback);
        
        $(window).on("keydown", (e) => {
            if($(":focus").length > 0) { return null; }
            const key = e.key.toLowerCase();
            if(key === " " || key == "k") {
                playback.button.trigger("click");
            }
        });
        
        playback.button.on("click", (e) => {
            playback.switch()
            playback.button.trigger("change");
        });

        playback.button.on("change", (e) => {
            const target = $(e.target);
            const state = target.value();
            
            const imageAttributes = obj[state]["img"];
            playback.image.attr(imageAttributes);
        });
    });
}