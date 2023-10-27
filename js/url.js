const getAppNameUrl = (appName) => {
    return [getAppUrl(), appName].join("/");
}