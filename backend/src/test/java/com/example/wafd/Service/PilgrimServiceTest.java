package com.example.wafd.Service;

import com.example.wafd.Api.ApiException;
import com.example.wafd.DTO.PilgrimDTOIn;
import com.example.wafd.DTO.PilgrimDTOOut;
import com.example.wafd.Model.Agency;
import com.example.wafd.Model.Pilgrim;
import com.example.wafd.Model.User;
import com.example.wafd.Repository.AgencyRepository;
import com.example.wafd.Repository.PilgrimRepository;
import com.example.wafd.Util.RegistrationNumberGenerator;
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
@DisplayName("PilgrimService Unit Tests")
class PilgrimServiceTest {

    @Mock
    private PilgrimRepository pilgrimRepository;

    @Mock
    private AgencyRepository agencyRepository;

    @Mock
    private RegistrationNumberGenerator registrationNumberGenerator;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private PilgrimService pilgrimService;

    private User adminUser;
    private Agency testAgency;

    @BeforeEach
    void setUp() {
        // Setup admin user for most tests
        adminUser = new User();
        adminUser.setId(1);
        adminUser.setRole("Admin");
        lenient().when(authenticationService.getCurrentUser()).thenReturn(adminUser);

        // Setup test agency
        testAgency = new Agency();
        testAgency.setId(1);
        testAgency.setName("Test Agency");
        testAgency.setMax_pilgrim(100);
    }

    @Nested
    @DisplayName("Adding Pilgrims")
    class AddPilgrimTests {

        @Test
        @DisplayName("Should generate unique registration number when adding pilgrim")
        void shouldGenerateRegistrationNumber() {
            // Given
            String expectedRegNumber = "WAFD-000001";
            when(registrationNumberGenerator.generate()).thenReturn(expectedRegNumber);
            when(agencyRepository.findAgencyById(1)).thenReturn(testAgency);

            PilgrimDTOIn pilgrimDTO = new PilgrimDTOIn();
            pilgrimDTO.setFirstName("Ahmed");
            pilgrimDTO.setLastName("Ali");
            pilgrimDTO.setPassportNumber("P1234567");
            pilgrimDTO.setGroupId(1);

            Pilgrim savedPilgrim = new Pilgrim();
            savedPilgrim.setRegistrationNumber(expectedRegNumber);
            savedPilgrim.setFirstName("Ahmed");
            savedPilgrim.setLastName("Ali");

            when(pilgrimRepository.save(any(Pilgrim.class))).thenReturn(savedPilgrim);

            // When
            PilgrimDTOOut result = pilgrimService.addPilgrim(pilgrimDTO);

            // Then
            assertThat(result.getRegistrationNumber()).isEqualTo(expectedRegNumber);
            verify(registrationNumberGenerator).generate();
            verify(pilgrimRepository).save(any(Pilgrim.class));
        }

        @Test
        @DisplayName("Should use passport as national ID when national ID is missing")
        void shouldFallbackToPassportForNationalId() {
            // Given
            when(registrationNumberGenerator.generate()).thenReturn("WAFD-000002");
            when(agencyRepository.findAgencyById(1)).thenReturn(testAgency);

            PilgrimDTOIn pilgrimDTO = new PilgrimDTOIn();
            pilgrimDTO.setFirstName("Fatima");
            pilgrimDTO.setPassportNumber("P9876543");
            pilgrimDTO.setGroupId(1);

            when(pilgrimRepository.save(any(Pilgrim.class))).thenAnswer(invocation -> {
                Pilgrim p = invocation.getArgument(0);
                // Should use passport as national ID
                assertThat(p.getNationalId()).isEqualTo("P9876543");
                return p;
            });

            // When
            pilgrimService.addPilgrim(pilgrimDTO);

            // Then
            verify(pilgrimRepository).save(any(Pilgrim.class));
        }

        @Test
        @DisplayName("Should throw exception when group is not found")
        void shouldThrowExceptionWhenGroupNotFound() {
            // Given
            when(registrationNumberGenerator.generate()).thenReturn("WAFD-000003");
            when(agencyRepository.findAgencyById(999)).thenReturn(null);

            PilgrimDTOIn pilgrimDTO = new PilgrimDTOIn();
            pilgrimDTO.setFirstName("Omar");
            pilgrimDTO.setGroupId(999);

            // When / Then
            assertThatThrownBy(() -> pilgrimService.addPilgrim(pilgrimDTO))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Group not found");
        }

        @Test
        @DisplayName("Should normalize gender to lowercase")
        void shouldNormalizeGender() {
            // Given
            when(registrationNumberGenerator.generate()).thenReturn("WAFD-000004");
            when(agencyRepository.findAgencyById(1)).thenReturn(testAgency);

            PilgrimDTOIn pilgrimDTO = new PilgrimDTOIn();
            pilgrimDTO.setFirstName("Sara");
            pilgrimDTO.setGender("FEMALE");
            pilgrimDTO.setGroupId(1);

            when(pilgrimRepository.save(any(Pilgrim.class))).thenAnswer(invocation -> {
                Pilgrim p = invocation.getArgument(0);
                assertThat(p.getGender()).isEqualTo("female");
                return p;
            });

            // When
            pilgrimService.addPilgrim(pilgrimDTO);

            // Then
            verify(pilgrimRepository).save(any(Pilgrim.class));
        }
    }

    @Nested
    @DisplayName("Adding Pilgrim to Group")
    class AddToGroupTests {

        @Test
        @DisplayName("Should add pilgrim to group successfully")
        void shouldAddPilgrimToGroup() {
            // Given
            Pilgrim pilgrim = new Pilgrim();
            pilgrim.setId(1);
            pilgrim.setFirstName("Ahmed");

            testAgency.setPilgrims(new java.util.HashSet<>());

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(pilgrim);
            when(agencyRepository.findAgencyById(1)).thenReturn(testAgency);
            when(pilgrimRepository.save(any(Pilgrim.class))).thenReturn(pilgrim);

            // When
            pilgrimService.addPilgrimToGroup(1, 1);

            // Then
            assertThat(pilgrim.getAgency()).isEqualTo(testAgency);
            verify(pilgrimRepository).save(pilgrim);
        }

        @Test
        @DisplayName("Should throw exception when group is full")
        void shouldRejectWhenGroupFull() {
            // Given
            Pilgrim pilgrim = new Pilgrim();
            pilgrim.setId(1);

            Agency fullAgency = new Agency();
            fullAgency.setId(1);
            fullAgency.setMax_pilgrim(2);
            // Add 2 pilgrims to make it full
            fullAgency.setPilgrims(new java.util.HashSet<>());
            fullAgency.getPilgrims().add(new Pilgrim());
            fullAgency.getPilgrims().add(new Pilgrim());

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(pilgrim);
            when(agencyRepository.findAgencyById(1)).thenReturn(fullAgency);

            // When / Then
            assertThatThrownBy(() -> pilgrimService.addPilgrimToGroup(1, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Group is full");
        }

        @Test
        @DisplayName("Should throw exception when pilgrim not found")
        void shouldThrowWhenPilgrimNotFound() {
            // Given
            when(pilgrimRepository.findPilgrimById(999)).thenReturn(null);

            // When / Then
            assertThatThrownBy(() -> pilgrimService.addPilgrimToGroup(999, 1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Pilgrim not found");
        }
    }

    @Nested
    @DisplayName("Updating Pilgrims")
    class UpdatePilgrimTests {

        @Test
        @DisplayName("Should update pilgrim successfully")
        void shouldUpdatePilgrim() {
            // Given
            Pilgrim existingPilgrim = new Pilgrim();
            existingPilgrim.setId(1);
            existingPilgrim.setFirstName("OldName");
            existingPilgrim.setAge(30);

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(existingPilgrim);
            when(pilgrimRepository.save(any(Pilgrim.class))).thenReturn(existingPilgrim);

            PilgrimDTOIn updateDTO = new PilgrimDTOIn();
            updateDTO.setFirstName("NewName");
            updateDTO.setAge(35);

            // When
            pilgrimService.updatePilgrim(1, updateDTO);

            // Then
            assertThat(existingPilgrim.getFirstName()).isEqualTo("NewName");
            assertThat(existingPilgrim.getAge()).isEqualTo(35);
            verify(pilgrimRepository).save(existingPilgrim);
        }

        @Test
        @DisplayName("Should prevent supervisor from updating pilgrims")
        void shouldPreventSupervisorUpdate() {
            // Given
            User supervisor = new User();
            supervisor.setRole("Supervisor");
            when(authenticationService.getCurrentUser()).thenReturn(supervisor);

            PilgrimDTOIn updateDTO = new PilgrimDTOIn();
            updateDTO.setFirstName("NewName");

            // When / Then
            assertThatThrownBy(() -> pilgrimService.updatePilgrim(1, updateDTO))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Supervisors are not allowed to edit");
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent pilgrim")
        void shouldThrowWhenUpdatingNonExistent() {
            // Given
            when(pilgrimRepository.findPilgrimById(999)).thenReturn(null);

            PilgrimDTOIn updateDTO = new PilgrimDTOIn();
            updateDTO.setFirstName("NewName");

            // When / Then
            assertThatThrownBy(() -> pilgrimService.updatePilgrim(999, updateDTO))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Pilgrim not found");
        }
    }

    @Nested
    @DisplayName("Deleting Pilgrims")
    class DeletePilgrimTests {

        @Test
        @DisplayName("Should delete pilgrim successfully")
        void shouldDeletePilgrim() {
            // Given
            Pilgrim pilgrim = new Pilgrim();
            pilgrim.setId(1);

            when(pilgrimRepository.findPilgrimById(1)).thenReturn(pilgrim);

            // When
            pilgrimService.deletePilgrim(1);

            // Then
            verify(pilgrimRepository).delete(pilgrim);
        }

        @Test
        @DisplayName("Should prevent supervisor from deleting pilgrims")
        void shouldPreventSupervisorDelete() {
            // Given
            User supervisor = new User();
            supervisor.setRole("Supervisor");
            when(authenticationService.getCurrentUser()).thenReturn(supervisor);

            // When / Then
            assertThatThrownBy(() -> pilgrimService.deletePilgrim(1))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Supervisors are not allowed to delete");
        }
    }
}
