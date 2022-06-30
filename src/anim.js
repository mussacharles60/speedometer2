document.addEventListener('DOMContentLoaded', function () {
    var nbreElementLoader = 5;
    for (var i = 0; i < nbreElementLoader; i++) {
        var loaderID = i + 1;
        var loaderForm = '<div class="loader-form" id="loaderForm_' + loaderID + '"></div>';
        $('#loading').append(loaderForm);
    }
});