if (constants === void 0) {

    /**
     * Constants.
     */
    var constants = {

        /**
         * Selectors.
         */
        selector: {
            github_header_ul: 'header nav ul',
            github_repo_ul: 'ul.repo-list',
            github_reponame_anchor: 'h3 a',
            github_filter_div: 'div.col-md-3.mb-6.mb-md-0',
            repo_tag_class: 'octotag-repo',
            filter_id: 'octotag-filter',
        },

        /**
         * Selectors, especially have functions.
         */
        functional: {
            edit_button_class: 'octotag-edit-button',
            edit_hint_class: 'octotag-edit-hint',
            edit_input_class: 'octotag-edit-input',
            taglist_ul_class: 'octotag-taglist',
            filtertaglist_ul_class: 'octotag-filtertaglist',
            checkedtag_class: 'checked',
            hidden_class: 'octotag-hidden',
        },

        /**
         * DOM which is added in page.
         */
        DOM: {
            stars_link_li: '<li><a class="js-selected-navigation-item HeaderNavlink px-lg-2 py-2 py-lg-0" href="/stars">&thinsp;Stars</a></li>',
            filterbytags_heading: '<hr><h3 class="h4 mb-2">Filter by tags</h3>',
        },

        /**
         * Key to get and to set data in chrome storage.
         */
        storageKey: 'octotagKey',

    };
}
