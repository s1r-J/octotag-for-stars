/**
 * octotag-for-stars
 * This chrome extension provides tag management for GitHub stared repositories.
 *
 * @version 0.1.0
 * @author s1r-J(https://github.com/s1r-J)
 */
$(function () {

    let setupTestdata = function () {

        let json = {
            '/FortAwesome/Font-Awesome': ['tag1', 'tag2', 'tag3'],
            '/google/gson': ['tag1', 'tag4']
        };

        chrome.storage.local.set({
            octotagKey: JSON.stringify(json)
        }, function () {
            console.log('Value is set to ' + JSON.stringify(json));
        });
    };

    let deleteTestDate = function () {
        chrome.storage.local.remove(constants.storageKey, function (data) {
            console.log('Successfully deleted', data);
        });
    };

    /**
     * Add hidden class to param not to display.
     * @param {jQuery object} $elem
     */
    const addHiddenClass = function ($elem) {
        $elem.addClass(constants.functional.hidden_class);
    };

    /**
     * Remove hidden class to param to display.
     * @param {jQuery object} $elem
     */
    const removeHiddenClass = function ($elem) {
        $elem.removeClass(constants.functional.hidden_class);
    };

    /**
     * Choose and display only repositories which have all tags.
     *     If param is empty, display all repos.
     * @param {array} tagArray
     */
    const filterByTags = function (tagArray) {

        let $repos = $(constants.selector.github_repo_ul).children('li');
        $repos.each(function () {
            let $repoli = $(this);
            if (tagArray.length == 0) {
                removeHiddenClass($repoli);
                return true;
            }
            let $tags = $repoli.find('div.octotag-repo .octotag-taglist li');
            let isDisplay = false;
            let matchCount = 0;
            $tags.each(function () {
                if (tagArray.includes($(this).text())) {
                    matchCount++;
                    if (matchCount == tagArray.length) {
                        isDisplay = true;
                        return false;
                    }
                }
            });

            if (isDisplay) {
                removeHiddenClass($repoli);
            } else {
                addHiddenClass($repoli);
            }
        });
    };

    /**
     * Update tags in filter area in page.
     * @param {JSON object} json
     */
    const updateTagsInFilterArea = function (json) {

        let tagSet = new Set();
        for (let k in json) {
            let tagArray = json[k];
            for (let tag of tagArray) {
                if (!tagSet.has(tag)) {
                    tagSet.add(tag);
                }
            }
        }

        let $octotagList = $('<ul>', {
            class: 'octotag-taglist octotag-filtertaglist',
        });
        let tagArray = Array.from(tagSet);
        tagArray.sort();
        tagArray.forEach(function (tag) {
            let $li = $('<li>');
            $li.append($('<input>', {
                type: 'checkbox',
                id: 'octotag-filter-' + tag,
                value: tag,
            })).append($('<label>', {
                for: 'octotag-filter-' + tag,
                text: tag,
            }));

            $octotagList.append($li);
        });

        $('.octotag-filtertaglist').empty();
        $('.octotag-filtertaglist').append($octotagList);

        addListeners();
    };

    /**
     * Save tag information to chrome storage, and update tags in page.
     * @param {jQuery object} $input
     */
    const saveEditTagsValue = function ($input) {

        addHiddenClass($input);
        addHiddenClass($input.prevAll('.octotag-edit-hint'));
        removeHiddenClass($input.prevAll('.octotag-edit-button'));

        let tagArray = $input.val().split(',').filter(function (item) {
            return item.replace(/[\s　]+/g, '') != '';
        });
        let tagSet = new Set();
        tagArray.forEach(function (item) {
            tagSet.add(item.replace(/(^[\s　]+)|([\s　]+$)/g, ''));
        });
        tagArray = Array.from(tagSet);
        tagArray.sort();

        $input.val(tagArray.join(', '));
        $input.attr('data-before', tagArray.join(', '));
        let $tagList = $input.nextAll('.octotag-taglist');
        $tagList.empty();
        tagArray.forEach(function (item) {
            $tagList.append($('<li>', {
                text: item,
            }));
        });

        const reponame = $input.attr('name');
        new Promise(function (resolve, reject) {
            chrome.storage.local.get([constants.storageKey], function (result) {
                let json = {};
                if (result[constants.storageKey] !== void 0) {
                    json = JSON.parse(result[constants.storageKey]);
                }
                json[reponame] = tagArray;
                chrome.storage.local.set({
                    octotagKey: JSON.stringify(json)
                }, function () {
                    // console.log('Value is set to ' + JSON.stringify(json));
                    chrome.storage.local.get([constants.storageKey], function (result) {
                        resolve(JSON.parse(result.octotagKey));
                    });
                });
            });
        }).then(function (data) {
            updateTagsInFilterArea(data);
        });
    };

    /**
     * Append tags to each repository.
     */
    const appendRepoTags = new Promise(function (resolve) {

        let $repolist = $(constants.selector.github_repo_ul);
        let reponameArray = [];
        $repolist.find(constants.selector.github_reponame_anchor).each(function () {
            reponameArray.push($(this).attr('href'));
        });

        chrome.storage.local.get([constants.storageKey], function (result) {

            let json = {};
            if (result[constants.storageKey] !== void 0) {
                json = JSON.parse(result[constants.storageKey]);
            }
            for (let reponame of reponameArray) {

                let $editHint = $('<span>', {
                    class: constants.functional.edit_hint_class + ' ' + constants.functional.hidden_class,
                    text: 'Edit tags using comma to separate tags, and press the enter-key to store tags.',
                });

                let $editInput = $('<input>', {
                    type: 'text',
                    class: constants.functional.edit_input_class + ' ' + constants.functional.hidden_class,
                    name: reponame,
                });

                let $editButton = createEditButton(reponame);

                let $octotagList = $('<ul>', {
                    class: constants.functional.taglist_ul_class,
                });
                let tagArray = json[reponame];
                if (tagArray !== void 0) {
                    for (let tag of tagArray) {
                        $octotagList.append($('<li>', {
                            text: tag,
                        }));
                    }

                    $editInput.val(tagArray.join(', '));
                    $editInput.attr('data-before', tagArray.join(', '));
                }

                let $octotag = $('<div>', {
                    class: constants.selector.repo_tag_class,
                }).append($editButton).append($editHint).append($editInput).append($octotagList);

                $('a[href="' + reponame + '"]', $repolist).parents('li').append($octotag);
            }

            resolve();
        });
    });

    /**
     * Create edit button for param repository.
     * @param {string} reponame
     * @return {jQuery object} $editButton
     */
    const createEditButton = function (reponame) {

        let $editButton = $('<button>', {
            type: 'button',
            class: constants.functional.edit_button_class,
            value: reponame,
        });
        $editButton.append($('<i>', {
            class: 'fas fa-edit',
        }));
        $editButton.append($('<span>', {
            text: ' Edit tags',
        }));

        return $editButton;
    };

    /**
     * Append tags to filter area.
     */
    const appendTagFilter = new Promise(function (resolve) {

        let $filterDiv = $('<div>', {
            id: constants.selector.filter_id,
        });

        chrome.storage.local.get([constants.storageKey], function (result) {
            let tagSet = new Set();
            let json = {};
            if (result[constants.storageKey] !== void 0) {
                json = JSON.parse(result[constants.storageKey]);
            }
            for (let k in json) {
                let array = json[k];
                for (let tag of array) {
                    if (!tagSet.has(tag)) {
                        tagSet.add(tag);
                    }
                }
            }
            let tagArray = Array.from(tagSet);
            tagArray.sort();

            let $octotagList = $('<ul>', {
                class: constants.functional.taglist_ul_class + ' ' + constants.functional.filtertaglist_ul_class,
            });
            tagArray.forEach(function (tag) {
                let $li = $('<li>');
                $li.append($('<input>', {
                    type: 'checkbox',
                    id: 'octotag-filter-' + tag,
                    value: tag,
                })).append($('<label>', {
                    for: 'octotag-filter-' + tag,
                    text: tag,
                }));

                $octotagList.append($li);
            });

            $filterDiv.append($octotagList);

            resolve();
        });
        $(constants.selector.github_filter_div).append(constants.DOM.filterbytags_heading).append($filterDiv);
    });

    /**
     * Add event listeners.
     */
    const addListeners = function () {

        $('.octotag-edit-button').on('click', function (event) {
            addHiddenClass($(this));
            removeHiddenClass($(this).nextAll('.octotag-edit-hint'));
            let $input = $(this).nextAll('.octotag-edit-input');
            removeHiddenClass($input);
            $input.focus();
        });

        $('.octotag-edit-input').on({
            'blur': function (event) {
                // undo editing tags
                $(this).val($(this).attr('data-before'));
                addHiddenClass($(this));
                addHiddenClass($(this).prevAll('.octotag-edit-hint'));
                removeHiddenClass($(this).prevAll('.octotag-edit-button'));
            },
            'keypress': function (event) {
                const enterKey = 13;
                if (event.which == enterKey) {
                    saveEditTagsValue($(this));
                }
            },
        });

        $('.octotag-filtertaglist input').on('change', function () {
            let $li = $(this).parents('li');
            if ($(this).prop('checked')) {
                $li.addClass(constants.functional.checkedtag_class);
            } else {
                $li.removeClass(constants.functional.checkedtag_class);
            }

            let tagArray = [];
            $('#octotag-filter li').each(function () {
                if ($(this).children('input').prop('checked')) {
                    tagArray.push($(this).children('input').val());
                }
            });

            filterByTags(tagArray);
        });
    };

    /**
     * Main method.
     */
    const main = new Promise(function (resolve) {

        $(constants.selector.github_header_ul).append(constants.DOM.stars_link_li);

        if (new RegExp('^/stars/?$').test(location.pathname)) {

            $('head').append($('<link>', {
                rel: 'stylesheet',
                href: chrome.extension.getURL('css/all.min.css'),
            }));
            $('head').append($('<link>', {
                rel: 'stylesheet',
                href: chrome.extension.getURL('css/style.css'),
            }));

            Promise.all([appendRepoTags, appendTagFilter]).then(function () {
                resolve('stars');
            });
        } else {
            resolve('github');
        }
    });

    //setupTestdata();
    //deleteTestDate();

    main.then(function (value) {
        addListeners();
    });
});
