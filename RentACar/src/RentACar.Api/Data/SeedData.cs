
using RentACar.Api.Models;

namespace RentACar.Api.Data
{
    public static class SeedData
    {
        public static List<Car> GetCars()
        {
            return new List<Car>
            {
                new Car
                {
                    Id = 1,
                    Brand = "Toyota",
                    Model = "Corolla",
                    LicensePlate = "AA-00-BB",
                    Category = "Economy",
                    DailyPrice = 35.00m,
                    ImageUrl = ""
                },

                new Car
                {
                    Id = 2,
                    Brand = "BMW",
                    Model = "Serie 3",
                    LicensePlate = "CC-11-DD",
                    Category = "Premium",
                    DailyPrice = 75.00m,
                    ImageUrl = ""
                },

                new Car
                {
                    Id = 3,
                    Brand = "Volkswagen",
                    Model = "Golf",
                    LicensePlate = "EE-22-FF",
                    Category = "Compact",
                    DailyPrice = 45.00m,
                    ImageUrl = ""
                },

                new Car
                {
                    Id = 4,
                    Brand = "Mercedes",
                    Model = "Classe A",
                    LicensePlate = "GG-33-HH",
                    Category = "Premium",
                    DailyPrice = 65.00m,
                    ImageUrl = ""
                },

                new Car
                {
                    Id = 5,
                    Brand = "Renault",
                    Model = "Clio",
                    LicensePlate = "II-44-JJ",
                    Category = "Economy",
                    DailyPrice = 30.00m,
                    ImageUrl = ""
                }
            };
        }
    }
}
