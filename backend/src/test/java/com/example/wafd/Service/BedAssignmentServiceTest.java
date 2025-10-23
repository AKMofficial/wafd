package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.Model.Bed;
import com.example.wafd.Model.Booking;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Repository.BedRepository;
import com.example.wafd.Repository.BookingRepository;
import com.example.wafd.Repository.PilgrimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("BedAssignmentService Unit Tests")
class BedAssignmentServiceTest {

    @Mock
    private BedRepository bedRepository;

    @Mock
    private PilgrimRepository pilgrimRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BedAssignmentService bedAssignmentService;

    private Pilgrim testPilgrim;
    private Bed availableBed;

    @BeforeEach
    void setUp() {
        testPilgrim = new Pilgrim();
        testPilgrim.setId(1);
        testPilgrim.setFirstName("Ahmed");
        testPilgrim.setLastName("Ali");
        testPilgrim.setRegistrationNumber("WAFD-000001");

        availableBed = new Bed();
        availableBed.setId(1);
        availableBed.setStatus("Available");
    }

    @Nested
    @DisplayName("Assigning Beds")
    class AssignBedTests {

        @Test
        @DisplayName("Should assign available bed to pilgrim successfully")
        void shouldAssignBedSuccessfully() {
            // Given
            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            Bed assignedBed = bedAssignmentService.assignBed(1, 1);

            // Then
            assertThat(assignedBed.getStatus()).isEqualTo("Booked");
            verify(bedRepository).save(availableBed);
            verify(bookingRepository).save(any(Booking.class));
        }

        @Test
        @DisplayName("Should create new booking when pilgrim has no existing booking")
        void shouldCreateNewBooking() {
            // Given - pilgrim with no booking
            testPilgrim.setBooking(null);

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            bedAssignmentService.assignBed(1, 1);

            // Then
            verify(bookingRepository).save(argThat(booking ->
                    booking.getPilgrim().equals(testPilgrim) &&
                    booking.getBed().equals(availableBed) &&
                    booking.getStatus().equals("Booked")
            ));
        }

        @Test
        @DisplayName("Should update existing booking when pilgrim has one")
        void shouldUpdateExistingBooking() {
            // Given - pilgrim with existing booking
            Booking existingBooking = new Booking();
            existingBooking.setPilgrim(testPilgrim);
            existingBooking.setStatus("Pending");
            testPilgrim.setBooking(existingBooking);

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bookingRepository.save(any(Booking.class))).thenReturn(existingBooking);
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            bedAssignmentService.assignBed(1, 1);

            // Then
            assertThat(existingBooking.getBed()).isEqualTo(availableBed);
            assertThat(existingBooking.getStatus()).isEqualTo("Booked");
            verify(bookingRepository).save(existingBooking);
        }

        @Test
        @DisplayName("Should throw exception when pilgrim not found")
        void shouldThrowWhenPilgrimNotFound() {
            // Given
            when(pilgrimRepository.findPilgrimById(999)).thenReturn(null);

            // When / Then
            assertThatThrownBy(() -> bedAssignmentService.assignBed(999, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Pilgrim not found");

            verify(bedRepository, never()).save(any());
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when bed not found")
        void shouldThrowWhenBedNotFound() {
            // Given
            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(999)).thenReturn(null);

            // When / Then
            assertThatThrownBy(() -> bedAssignmentService.assignBed(1, 999))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Bed not found");

            verify(bedRepository, never()).save(any());
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when bed is not available")
        void shouldThrowWhenBedNotAvailable() {
            // Given
            availableBed.setStatus("Booked");

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(1)).thenReturn(availableBed);

            // When / Then
            assertThatThrownBy(() -> bedAssignmentService.assignBed(1, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Bed is not available");

            verify(bedRepository, never()).save(any());
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should mark bed as booked after assignment")
        void shouldMarkBedAsBooked() {
            // Given
            when(pilgrimRepository.findPilgrimById(1)).thenReturn(testPilgrim);
            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            bedAssignmentService.assignBed(1, 1);

            // Then
            assertThat(availableBed.getStatus()).isEqualTo("Booked");
            verify(bedRepository).save(availableBed);
        }
    }

    @Nested
    @DisplayName("Vacating Beds")
    class VacateBedTests {

        @Test
        @DisplayName("Should vacate bed and mark as available")
        void shouldVacateBedSuccessfully() {
            // Given
            availableBed.setStatus("Booked");

            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            Bed vacatedBed = bedAssignmentService.vacateBed(1);

            // Then
            assertThat(vacatedBed.getStatus()).isEqualTo("Available");
            verify(bedRepository).save(availableBed);
        }

        @Test
        @DisplayName("Should cancel booking when vacating bed with booking")
        void shouldCancelBookingWhenVacating() {
            // Given
            Booking booking = new Booking();
            booking.setId(1);
            booking.setStatus("Booked");
            booking.setBed(availableBed);
            availableBed.setBooking(booking);
            availableBed.setStatus("Booked");

            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            bedAssignmentService.vacateBed(1);

            // Then
            assertThat(booking.getStatus()).isEqualTo("Cancelled");
            verify(bookingRepository).save(booking);
        }

        @Test
        @DisplayName("Should handle vacating bed without booking")
        void shouldHandleVacatingBedWithoutBooking() {
            // Given
            availableBed.setBooking(null);
            availableBed.setStatus("Booked");

            when(bedRepository.findBedById(1)).thenReturn(availableBed);
            when(bedRepository.save(any(Bed.class))).thenReturn(availableBed);

            // When
            Bed vacatedBed = bedAssignmentService.vacateBed(1);

            // Then
            assertThat(vacatedBed.getStatus()).isEqualTo("Available");
            verify(bookingRepository, never()).save(any());
            verify(bedRepository).save(availableBed);
        }

        @Test
        @DisplayName("Should throw exception when bed not found for vacating")
        void shouldThrowWhenBedNotFoundForVacating() {
            // Given
            when(bedRepository.findBedById(999)).thenReturn(null);

            // When / Then
            assertThatThrownBy(() -> bedAssignmentService.vacateBed(999))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Bed not found");

            verify(bedRepository, never()).save(any());
        }
    }
}
