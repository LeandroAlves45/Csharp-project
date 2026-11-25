using RentACar.Api.Models;

namespace RentACar.Api.Data
{
    public static class SeedData
    {
        public static List<Car> GetCars()
        {
            return new List<Car>
            {
                new Car { Id = 1,  Brand = "Toyota",     Model = "Corolla",   LicensePlate = "AA-00-BB", Category = "Economy", DailyPrice = 35.00m, ImageUrl = "/images/cars/toyota-corolla.jpg" },
                new Car { Id = 2,  Brand = "BMW",        Model = "Serie 3",   LicensePlate = "CC-11-DD", Category = "Premium", DailyPrice = 75.00m, ImageUrl = "/images/cars/bmw-serie-3.jpg" },
                new Car { Id = 3,  Brand = "Volkswagen", Model = "Golf",      LicensePlate = "EE-22-FF", Category = "Compact", DailyPrice = 45.00m, ImageUrl = "/images/cars/volkswagen-golf.jpg" },
                new Car { Id = 4,  Brand = "Mercedes",   Model = "Classe A",  LicensePlate = "GG-33-HH", Category = "Premium", DailyPrice = 65.00m, ImageUrl = "/images/cars/mercedes-classe-a.jpg" },
                new Car { Id = 5,  Brand = "Renault",    Model = "Clio",      LicensePlate = "II-44-JJ", Category = "Economy", DailyPrice = 30.00m, ImageUrl = "/images/cars/renault-clio.jpg" },
                
                new Car { Id = 6,  Brand = "Peugeot",    Model = "208",       LicensePlate = "KK-55-LL", Category = "Economy",  DailyPrice = 32.00m,  ImageUrl = "/images/cars/peugeot-208.jpg" },
                new Car { Id = 7,  Brand = "Opel",       Model = "Corsa",     LicensePlate = "MM-66-NN", Category = "Economy",  DailyPrice = 29.00m,  ImageUrl = "/images/cars/opel-corsa.jpg" },
                new Car { Id = 8,  Brand = "Fiat",       Model = "500",       LicensePlate = "OO-77-PP", Category = "Economy",  DailyPrice = 28.00m,  ImageUrl = "/images/cars/fiat-500.jpg" },
                new Car { Id = 9,  Brand = "Ford",       Model = "Focus",     LicensePlate = "QQ-88-RR", Category = "Compact",  DailyPrice = 42.00m,  ImageUrl = "/images/cars/ford-focus.jpg" },
                new Car { Id = 10, Brand = "SEAT",       Model = "Leon",      LicensePlate = "SS-99-TT", Category = "Compact",  DailyPrice = 44.00m,  ImageUrl = "/images/cars/seat-leon.jpg" },
                new Car { Id = 11, Brand = "Hyundai",    Model = "i30",       LicensePlate = "UU-10-VV", Category = "Compact",  DailyPrice = 40.00m,  ImageUrl = "/images/cars/hyundai-i30.jpg" },
                new Car { Id = 12, Brand = "Audi",       Model = "A3",        LicensePlate = "WW-21-XX", Category = "Premium",  DailyPrice = 70.00m,  ImageUrl = "/images/cars/audi-a3.jpg" },
                new Car { Id = 13, Brand = "Nissan",     Model = "Qashqai",   LicensePlate = "YY-32-ZZ", Category = "SUV",      DailyPrice = 55.00m,  ImageUrl = "/images/cars/nissan-qashqai.jpg" },
                new Car { Id = 14, Brand = "Kia",        Model = "Sportage",  LicensePlate = "AB-43-CD", Category = "SUV",      DailyPrice = 60.00m,  ImageUrl = "/images/cars/kia-sportage.jpg" },
                new Car { Id = 15, Brand = "Tesla",      Model = "Model 3",   LicensePlate = "EF-54-GH", Category = "Electric", DailyPrice = 95.00m,  ImageUrl = "/images/cars/tesla-model-3.jpg" }
            };
        }
    }
}