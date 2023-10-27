const getAppUrl = (appName) => {
    return [getBaseUrl(), "app", appName].join("/");
}