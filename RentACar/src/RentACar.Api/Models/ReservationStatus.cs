using System;
using System.Text.Json.Serialization;
namespace RentACar.Api.Models
{
    // O JSON leva "Active"/"Cancelled" em vez de 0/1: mais fácil de ler e o frontend compara texto
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReservationStatus
    {
        Active,
        Cancelled,
    }
}
