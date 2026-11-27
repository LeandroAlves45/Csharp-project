using RentACar.Api.Exceptions;
using RentACar.Api.Models;
using RentACar.Api.Repositories;
using RentACar.Api.Repositories.InMemory;
using RentACar.Api.Services;

namespace RentACar.Tests;

// Testes das regras novas de 26/11 (R2 "a partir de amanhã", R3 dia de limpeza, R6 utilizador).
// Cada teste cria repositórios novos em memória: os testes não partilham dados entre si.
public class ReservationServicesTests
{
    private readonly ReservationServices _service;
    private readonly int _userA;
    private readonly int _userB;

    // As datas são relativas a hoje, para os testes continuarem válidos noutro dia
    private static readonly DateOnly Today = DateOnly.FromDateTime(DateTime.Today);

    public ReservationServicesTests()
    {
        var users = new MemoryUserRepository();
        users.Add(new User { Name = "Ana", Email = "ana@teste.com" });
        users.Add(new User { Name = "Rui", Email = "rui@teste.com" });
        _userA = users.GetByEmail("ana@teste.com")!.Id;
        _userB = users.GetByEmail("rui@teste.com")!.Id;

        _service = new ReservationServices(
            new InMemoryReservationRepository(),
            new InMemoryCarRepository(),
            users);
    }

    private Reservation NewReservation(int userId, int carId, int startInDays, int endInDays)
    {
        return new Reservation
        {
            UserId = userId,
            CarId = carId,
            StartDate = Today.AddDays(startInDays),
            EndDate = Today.AddDays(endInDays)
        };
    }

    [Fact]
    public void CreateReservation_WhenStartIsToday_ThrowsBadRequestException()
    {
        var reservation = NewReservation(_userA, carId: 1, startInDays: 0, endInDays: 2);

        Assert.Throws<BadRequestException>(() => _service.CreateReservation(reservation));
    }

    [Fact]
    public void CreateReservation_WhenStartIsTomorrow_CreatesActiveReservation()
    {
        var reservation = NewReservation(_userA, carId: 1, startInDays: 1, endInDays: 3);

        _service.CreateReservation(reservation);

        Assert.Equal(ReservationStatus.Active, reservation.Status);
    }

    [Fact]
    public void CreateReservation_WhenUserAlreadyHasCarInSameDates_ThrowsConflictException()
    {
        _service.CreateReservation(NewReservation(_userA, carId: 1, startInDays: 2, endInDays: 5));

        var secondCar = NewReservation(_userA, carId: 2, startInDays: 3, endInDays: 6);

        var error = Assert.Throws<ConflictException>(() => _service.CreateReservation(secondCar));
        Assert.Equal("Não é possível ter dois carros reservados para as mesmas datas.", error.Message);
    }

    [Fact]
    public void CreateReservation_WhenUserPicksAnotherCarOnReturnDay_IsAllowed()
    {
        _service.CreateReservation(NewReservation(_userA, carId: 1, startInDays: 2, endInDays: 5));

        // Devolve o carro 1 no dia 5 e levanta o carro 2 no mesmo dia
        var nextCar = NewReservation(_userA, carId: 2, startInDays: 5, endInDays: 7);

        _service.CreateReservation(nextCar);
        Assert.Equal(ReservationStatus.Active, nextCar.Status);
    }

    [Fact]
    public void CreateReservation_WhenCarStartsOnReturnDayOfAnotherUser_ThrowsConflictException()
    {
        _service.CreateReservation(NewReservation(_userA, carId: 1, startInDays: 2, endInDays: 5));

        // O dia 5 é o dia de limpeza do carro 1
        var sameCar = NewReservation(_userB, carId: 1, startInDays: 5, endInDays: 7);

        Assert.Throws<ConflictException>(() => _service.CreateReservation(sameCar));
    }

    [Fact]
    public void CreateReservation_WhenCarStartsDayAfterReturn_IsAllowed()
    {
        _service.CreateReservation(NewReservation(_userA, carId: 1, startInDays: 2, endInDays: 5));

        var sameCar = NewReservation(_userB, carId: 1, startInDays: 6, endInDays: 8);

        _service.CreateReservation(sameCar);
        Assert.Equal(ReservationStatus.Active, sameCar.Status);
    }

    [Fact]
    public void IsCarAvailable_WhenReservationIsCancelled_ReturnsTrue()
    {
        var reservation = NewReservation(_userA, carId: 1, startInDays: 5, endInDays: 8);
        _service.CreateReservation(reservation);
        _service.CancelReservation(reservation.Id, _userA);

        Assert.True(_service.IsCarAvailable(1, Today.AddDays(5), Today.AddDays(8)));
    }
}
