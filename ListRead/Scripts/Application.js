$(document).ready(function () {
    function toggleDivs() {
        $('#BookList').slideToggle('fast');
        $('#BookEdit').slideToggle();
    }

    function initializeDivs() {
        $('#BookEdit').slideUp();
        $('#loading').fadeIn();
        $('#BookList').slideDown(loadReadingList);
    }

    function clearFields() {
        $('#bookId').val('');
        $('#txtTitle').val('');
        $('#txtAuthor').val('');
        $('#txtCategory').val('');
        $('#txtPriority').val('');
    }

    function editBook(bookId) {

        var book = new BookItem();

        book.set({ id: bookId });
        $('#bookId').val(bookId);
        var bookView = new BookEditView({ model: book });

        book.fetch({
            success: function () {
                toggleDivs();
            },
            error: function (model, response) {
                alert(response);
            }
        });

    };    

    var BookItem = Backbone.Model.extend(
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

    var BookEditView = Backbone.View.extend({
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

    var BookView = Backbone.View.extend({
        className: 'listBooks',
        events:
        {
            "click h3": "searchBook",
            "click button": "searchBook"
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
        searchBook: function () {            
            BookApp.navigate("book/" + this.model.toJSON().Id, { trigger: true });
        }
    });

    var BookList = Backbone.Collection.extend({
        model: BookItem,
        url: '/api/Book',
        initialize: function () {
            this.on('error', this.printError, this);
        },
        printError: function (model, error) {

            alert(error.responseText);
        }
    });

    var BookListView = Backbone.View.extend({
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
            var bookView = new BookView({ model: bookItem });
            bookView.render();
            this.$el.append(bookView.el);

        },
        addAll: function () {

            $('#readingList').html('');
            this.render();

            $('#readingList').html(this.el);
        }
    });

    var BookRouter = Backbone.Router.extend({
        routes: {
            "": "index",
            "book/:id": "show",
            "book": "newBook"
        },
        start: function ()
        {
            Backbone.history.start({ pushState: true });            
        },
        initialize: function (options) {
            this.bookList = options.bookList;
        },
        show: function (id) {
            editBook(id);
        },
        index: function () {
            initializeDivs();            
        },
        newBook: function ()
        {            
            toggleDivs();
            clearFields();
        }
    });

    function loadReadingList() {

        bookList.fetch({
            success: function () {
                $('#loading').fadeOut();
            },
            error: function (error)
            {
                alert(error);
            }
        });
    }

    $('#Add').click(function () {
        BookApp.navigate("book", { trigger: true });        
    });

    $('#btnSave').click(function () {

        var book = new BookItem();

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

                bookList.fetch();
                clearFields();
                toggleDivs();
                BookApp.navigate("", { trigger: true });
            }
        });
    });

    $('#btnDelete').click(function () {

        var book = new BookItem();
        book.set({ id: parseInt($('#bookId').val()) });
        book.destroy({
            success: function () {
                toggleDivs();
                bookList.fetch();
                clearFields();
                BookApp.navigate("", { trigger: true });
            },
            error: function (model, error) {
                alert(error);
            }
        });
    });

    $('#btnCancel').click(function () {
        toggleDivs();
        clearFields();
        BookApp.navigate("", { trigger: true });
    });
    
    var bookList = new BookList();
    var bookListView = new BookListView({ collection: bookList });
    var BookApp = new BookRouter({ bookList: bookList });
    BookApp.start();
        
    
});