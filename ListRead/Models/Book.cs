using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ListRead.Models
{
    public class Book
    {
        public int Id               { get; set; }
        
        [Required]
        public string Title         { get; set; }
        public string Author        { get; set; }
        public string Url           { get; set; }
        public string Category      { get; set; }
        
        public int? Priority        { get; set; }

        public string Status        { get; set; }
    }
}