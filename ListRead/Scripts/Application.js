$(document).ready(function () {
    function toggleDivs() {
        $('#BookList').slideToggle('fast');
        $('#BookEdit').slideToggle();
    }

    function initializeDivs() {        
        $('#BookEdit').slideUp();
        $('#loading').fadeOut();
        $('#BookList').slideDown();
    }

    function clearFields() {
        $('#bookId').val('');
        $('#txtTitle').val('');
        $('#txtAuthor').val('');
        $('#txtCategory').val('');
        $('#txtPriority').val('');
        $('#readingList').html('');
    }

    $('#Add').click(function () {

        App.router.navigate("book", { trigger: true });
    });

    $('#btnSave').click(function () {

        var book = new App.Models.BookItem();

        if ($('#bookId').val() != "") {
            book.set({ id: parseInt($('#bookId').val()) });
        }
        book.set({ Title: $('#txtTitle').val() });
        book.set({ Author: $('#txtAuthor').val() });
        book.set({ Category: $('#txtCategory').val() });
        book.set({ Priority: $('#txtPriority').val() });

        if ($('#status').attr('checked')) {
            book.set({ Status: "Complete" });
        }
        else {
            book.set({ Status: "Incomplete" });
        }

        book.save({}, {
            success: function () {
                App.router.navigate("", { trigger: true });                
            }
        });
    });

    $('#btnDelete').click(function () {

        var book = new App.Models.BookItem();
        book.set({ id: parseInt($('#bookId').val()) });
        book.destroy({
            success: function () {
                App.router.navigate("", { trigger: true });
            },
            error: function (model, error) {
                alert(error);
            }
        });
    });

    $('#btnCancel').click(function () { 
        App.router.navigate("", { trigger: true });
    });

    var App =
    {
        Models: {},
        Views: {},
        Collections: {},
        Router: {},
        events: {
            'click a': function (e) {
                e.preventDefault();
                Backbone.history.navigate(e.target.pathname, { trigger: true });
            }
        },
        start: function () {            
            App.Collections.books = new App.Collections.BookList();
            App.Collections.bookListView = new App.Views.BookListView({ collection: App.Collections.books });
            App.router = new App.Router();

            this.router.navigate("", { trigger: true });
            Backbone.history.start({ pushState: true });

        }
    };

    App.Models.BookItem = Backbone.Model.extend(
    {
        urlRoot: '/api/Book',
        initialize: function () {
            this.on('error', this.printError, this);
        },
        printError: function (error) {
            alert(error);
        },
        toggleStatus: function () {
            if (this.get('status') === 'complete') {
                this.set({ status: 'incomplete' });
            }
            else {
                this.set({ status: 'complete' })
            }
            this.save();
        },
        getStatus: function () {
            if (this.toJSON().Status === "Complete") {
                return "Complete"
            }
            else {
                return "Incomplete";
            }
        }
    });

    App.Views.BookEditView = Backbone.View.extend({
        events:
        {
            'change #status': 'toggleStatus'
        },
        initialize: function () {
            this.model.on('change', this.render, this);
            this.model.on('destroy', this.remove, this);
            this.model.on('sync', this.render, this);
        },
        render: function () {

            var model = this.model.toJSON();

            if (model.Status === 'Complete') {
                $('#status').attr('checked', true);
            }
            else {
                $('#status').attr('checked', false);

            }
            $('#txtTitle').val(model.Title);
            $('#txtAuthor').val(model.Author);
            $('#txtCategory').val(model.Category);
            $('#txtPriority').val(model.Priority);
        },
        remove: function () {
            $('#view').fadeOut();
            $('#view').html('');
        },
        toggleStatus: function (e) {
            alert('tootl');
            this.model.toggleStatus();
        }
    });

    App.Views.BookView = Backbone.View.extend({
        className: 'listBooks',
        events:
        {
            "click h3": "editBook",
            "click button": "editBook"
        },
        initialize: function () {
            this.model.on('change', this.render, this);
            this.model.on('sync', this.render, this);
        },
        render: function () {
            var status = this.model.getStatus();
            var model = this.model.toJSON();
            var html =
                '<p class="priority">' + model.Priority + '</p> ' +
                '<h3>' + model.Title + '</h3>' +
                '<p>' + model.Author + '</p>' +
                '<p>' + model.Category + '</p>' +
                '<p class="' + status + '">' + status + '</p>' +
                '<p><input type="button" value="Edit" class="invisible"/></p>' +
                '<p><input type="button" value="Delete" class="invisible" /></p>';
            this.$el.append(html);
        },
        editBook: function () {            
            App.router.navigate("book/" + this.model.toJSON().Id, { trigger: true });
        }
    });

    App.Collections.BookList = Backbone.Collection.extend({
        model: App.Models.BookItem,
        url: '/api/Book',
        comparator: 'Priority',
        completedRead: function () {
            return this.where({ status: 'Complete' }).length;
        },
        incompletedRead: function () {
            return this.where({ status: 'Incomplete' }).length;
        },
        initialize: function () {
            this.on('error', this.printError, this);
        },
        printError: function (model, error) {

            alert(error.responseText);
        }
    });

    App.Views.BookListView = Backbone.View.extend({
        el: $('#readingList'),
        render: function () {
            this.collection.forEach(this.addBook, this)
        },
        initialize: function () {
            //this.collection.on('add', this.addAll, this);
            //this.collection.on('reset', this.addAll, this);
            this.collection.on('sync', this.addAll, this);
            //this.on('remove', this.render)
        },
        addBook: function (bookItem) {
            var bookView = new App.Views.BookView({ model: bookItem });
            bookView.render();
            this.$el.append(bookView.el);

        },
        addAll: function () {
            this.render();
        }
    });

    App.Router = Backbone.Router.extend({
        routes: {
            "": "index",
            "book/:id": "editBook",
            "book": "newBook",
            '*path': 'notFound'
        },
        editBook: function (id) {
            var book = new App.Models.BookItem();
            book.set({ id: id });
            $('#bookId').val(id);
            var bookView = new App.Views.BookEditView({ model: book });
            book.fetch({
                success: function () {
                    toggleDivs();
                },
                error: function (model, response) {
                    alert(response);
                }
            });
        },
        index: function () {
            
            App.Collections.books.fetch({
                success: function ()
                {
                    initializeDivs();
                    clearFields();
                }
            });
        },
        newBook: function () {
            toggleDivs();
            clearFields();
        },
        notfound: function (path) {
            alert('Sorry! There is no content here.');
        }
    });

    App.start();

});