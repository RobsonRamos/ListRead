using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ListRead.Models;

namespace ListRead.Repository
{
    public class BookRepository
    {
        private List<Book> books = new List<Book>();
        private int nextId = 14;
        public BookRepository()
        {
            books.AddRange(
                new []
                {
                        new Book{ Id = 1, Title = "JavaScript: The Good Parts", Author = "Douglas Crockford", Priority = 1, Url = "http://www.amazon.com/gp/product/0596517742", Status = "Complete",Category = "Technology"},
                        new Book{ Id = 2, Title = "Pro ASP.NET MVC 4", Author = "Adam Freeman", Category = "Technology", Priority = 2, Url = "http://www.amazon.com/Pro-ASP-NET-MVC-Adam-Freeman/dp/1430242361/ref=sr_1_1?s=books&ie=UTF8&qid=1374635321&sr=1-1&keywords=mvc4"},
                        new Book{ Id = 3, Title = "Diário de um mago", Author = "Paulo Coelho", Category = "Self-help", Priority = 3},
                        new Book{ Id = 4, Title = "Vidas Secas", Author = "Graciliando Ramos", Priority = 4, Category = "Drama"},
                        new Book{ Id = 5, Title = "jQuery: Novice to Ninja", Author = "Earle Castledine", Priority = 5, Category = "Technology"},
                        new Book{ Id = 6, Title = "jQuery Cookbook", Author = "Cody Lindley", Priority = 6, Category = "Technology"},
                        new Book{ Id = 7, Title = "Clean Code: A Handbook of Agile Software Craftsmanship", Author = "Robert C Martin", Priority = 7, Category = "Technology"},
                        new Book{ Id = 8, Title = "Agile Principles, Patterns, and Practices in C# ", Author = "Robert C Martin", Priority = 8, Category = "Technology"},
                        new Book{ Id = 9, Title = "Patterns of Enterprise Application Architecture", Author = "Martin Fowler", Priority = 9, Category = "Technology"},
                        new Book{ Id = 10, Title = "Design Patterns: Elements of Reusable Object-Oriented Software", Author = "Gang Of Four", Priority = 10, Category = "Technology"},
                        new Book{ Id = 11, Title = "Design Patterns: Elements of Reusable Object-Oriented Software", Author = "Gang Of Four", Priority = 11, Category = "Technology"},
                        new Book{ Id = 12, Title = "Refactoring: Improving the Design of Existing Code", Author = "Martin Fowler", Priority = 12, Category = "Technology"},
                        new Book{ Id = 13, Title = "Test Driven Development: By Example", Author = "Kent Beck", Priority = 13, Category = "Technology"},
                }.ToList()                
            );
        }

        public Book Add(Book item)
        {
            ChangePriority(item); 
            item.Id = nextId;     
            books.Add(item);
            nextId++;
            return item;
        }

        public void Delete(int id)
        { 
            var item = books.Find(x => x.Id == id);
            if(item != null)
            {
                books.Remove(item);
            }            
        }

        public void Update(Book item)
        {
            var removed = books.Find(x => x.Id == item.Id);
            if (removed != null)
            {
                ChangePriority(item);
                Delete(item.Id);
            }            
            books.Add(item);
        }

        protected void UpdateWithoutChanhgePriority(Book item)
        {
            var removed = books.Find(x => x.Id == item.Id);
            if (removed != null)
            {
                Delete(item.Id);
            }
            books.Add(item);
        }

        public Book Get(int id)
        {
            return books.Find(x => x.Id == id);
        }


        public List<Book> GetAll()
        {
            return books;  
        }

        protected void ChangePriority(Book item)
        {
            if (item.Priority > 0)
            {
                var book = books.Find(x => x.Priority == item.Priority);
                if (book != null)
                {
                    if (item.Id != 0)
                    {
                        if (book != null)
                        {
                            var oldBook = books.Find(x => x.Id == item.Id);
                            book.Priority = oldBook.Priority;
                        }
                    }
                    else
                    {
                        book.Priority = (books.Count + 1);
                    }
                    UpdateWithoutChanhgePriority(book);
                }
            }
            else
            {
                item.Priority = ( books.Count + 1);
            }
        }

        public List<Book> Find(Func<Book, bool> predicate)
        {
            return books.Where(predicate).ToList();
        }

        public int GetNextPriority()
        {
            return books.Max(x => x.Priority.Value) + 1;
        }
    }
}