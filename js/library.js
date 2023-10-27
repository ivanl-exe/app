$(window).ready(() => {
    const libraryPlan = new LibraryPlan();
    libraryPlan.load().then((libraryPlan) => {
        for(const [title, appProperties] of Object.entries(libraryPlan)) {
            const app = new App(Object.assign(appProperties, {"title": title}));
            const shelf = $(".shelf-container"); 
            app.shelf(onto = shelf);
        }
    });
})