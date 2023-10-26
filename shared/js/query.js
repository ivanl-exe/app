const isDict = (obj) => {
    return typeof obj === "object" && obj instanceof Object && !Array.isArray(obj);
}

class Query {
    constructor(search = () => window.location.search) {
        this.search = search;
    }

    #serialize(search) {
        let query = "?";
        let params = Object.entries(search).map(param => {
            return param.map((s) => encodeURIComponent(s)).join("=")
        });
        query += params.join("&");
        return query;
    }

    #deserialize(query) {
        let search = {};
        if(query[0] == "?") {
            query.slice(1).split("&").forEach((param) => {
                const [key, value] = param.split("=").map((s) => decodeURIComponent(s));
                search[key] = value;
            });
        }
        return search;
    }

    get(key = null) {
        const search = this.#deserialize(
            this.search()
        );
        if(key == null) { return search; }
        return search[key];
    }

    set(_key, value = null) {
        let search = this.#deserialize(
            this.search()
        );
        if(!isDict(_key)) {
            _key = {[_key]: value};
        }
        for(const [key, value] of Object.entries(_key)) {
            search[key] = value;
        }
        const query = this.#serialize(search);
        window.history.pushState({}, document.title, query);
        return query;
    }
}
