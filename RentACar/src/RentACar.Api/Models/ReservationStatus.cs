using System;
using System.Text.Json.Serialization;
namespace RentACar.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReservationStatus
    {
        Active,
        Cancelled,
    }
}
