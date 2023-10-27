class App {
    constructor(content) {
        this.content = content;
        this.title = this.content["title"];
        this.path = this.content["path"];
        this.image = this.content["image"];
    }

    shelf(onto) {
        const app = addChild(onto, "button", "app-container shelf-item");
        
        const appURL = getAppUrl(this.path);
        app.on("click", () => window.open(appURL, "_self"));

        //image
        const appImage = addChild(app, "img", "app-image app-item");
        const imagePath = [this.path, this.image.src].join("/");
        appImage.attr("src", imagePath);
        appImage.attr("alt", this.title);
        
        //title
        const appTitle = addChild(app, "h3", "app-title app-item");
        appTitle.text(this.title);
    }
}

class LibraryPlan {
    constructor(path = "json/library/index.json") {
        this.path = path;
    }

    async load() {
        return (
            await $.getJSON(this.path)
                .fail(() => this.load())
        );
    }
}