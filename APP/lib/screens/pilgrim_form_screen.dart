import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/pilgrim.dart';
import '../service_locator.dart';

class PilgrimFormScreen extends StatefulWidget {
  final Pilgrim? pilgrim; // null for add, non-null for edit

  const PilgrimFormScreen({super.key, this.pilgrim});

  @override
  State<PilgrimFormScreen> createState() => _PilgrimFormScreenState();
}

class _PilgrimFormScreenState extends State<PilgrimFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Form controllers
  late TextEditingController _nationalIdController;
  late TextEditingController _passportController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _ageController;
  late TextEditingController _nationalityController;
  late TextEditingController _phoneController;
  late TextEditingController _specialNeedsNotesController;
  late TextEditingController _notesController;

  // Form values
  Gender _selectedGender = Gender.male;
  bool _hasSpecialNeeds = false;
  SpecialNeedsType? _specialNeedsType;
  PilgrimStatus _selectedStatus = PilgrimStatus.expected;

  @override
  void initState() {
    super.initState();

    // Initialize controllers with existing data if editing
    _nationalIdController = TextEditingController(text: widget.pilgrim?.nationalId ?? '');
    _passportController = TextEditingController(text: widget.pilgrim?.passportNumber ?? '');
    _firstNameController = TextEditingController(text: widget.pilgrim?.firstName ?? '');
    _lastNameController = TextEditingController(text: widget.pilgrim?.lastName ?? '');
    _ageController = TextEditingController(text: widget.pilgrim?.age.toString() ?? '');
    _nationalityController = TextEditingController(text: widget.pilgrim?.nationality ?? '');
    _phoneController = TextEditingController(text: widget.pilgrim?.phoneNumber ?? '');
    _specialNeedsNotesController = TextEditingController(text: widget.pilgrim?.specialNeedsNotes ?? '');
    _notesController = TextEditingController(text: widget.pilgrim?.notes ?? '');

    if (widget.pilgrim != null) {
      _selectedGender = widget.pilgrim!.gender ?? Gender.male;
      _hasSpecialNeeds = widget.pilgrim!.hasSpecialNeeds;
      _specialNeedsType = widget.pilgrim!.specialNeedsType;
      _selectedStatus = widget.pilgrim!.status ?? PilgrimStatus.expected;
    }
  }

  @override
  void dispose() {
    _nationalIdController.dispose();
    _passportController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _ageController.dispose();
    _nationalityController.dispose();
    _phoneController.dispose();
    _specialNeedsNotesController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _savePilgrim() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'nationalId': _nationalIdController.text.trim(),
        'passportNumber': _passportController.text.trim().isEmpty ? null : _passportController.text.trim(),
        'firstName': _firstNameController.text.trim(),
        'lastName': _lastNameController.text.trim(),
        'age': int.parse(_ageController.text.trim()),
        'gender': _selectedGender.name,
        'nationality': _nationalityController.text.trim(),
        'phoneNumber': _phoneController.text.trim(),
        'hasSpecialNeeds': _hasSpecialNeeds,
        'specialNeedsType': _hasSpecialNeeds && _specialNeedsType != null ? _specialNeedsType!.name : null,
        'specialNeedsNotes': _hasSpecialNeeds ? _specialNeedsNotesController.text.trim() : null,
        'notes': _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        'status': _selectedStatus.name,
      };

      if (widget.pilgrim == null) {
        // Add new pilgrim
        await ServiceLocator.pilgrim.addPilgrim(data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pilgrim added successfully')),
          );
        }
      } else {
        // Update existing pilgrim
        await ServiceLocator.pilgrim.updatePilgrim(widget.pilgrim!.id, data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pilgrim updated successfully')),
          );
        }
      }

      if (mounted) {
        Navigator.of(context).pop(true); // Return true to indicate success
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.pilgrim == null ? 'Add Pilgrim' : 'Edit Pilgrim'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Personal Information Section
            _buildSectionHeader('Personal Information'),
            const SizedBox(height: 16),

            // First Name
            TextFormField(
              controller: _firstNameController,
              decoration: const InputDecoration(
                labelText: 'First Name *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter first name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Last Name
            TextFormField(
              controller: _lastNameController,
              decoration: const InputDecoration(
                labelText: 'Last Name *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter last name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Gender Selection
            DropdownButtonFormField<Gender>(
              value: _selectedGender,
              decoration: const InputDecoration(
                labelText: 'Gender *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.wc),
              ),
              items: Gender.values.map((gender) {
                return DropdownMenuItem(
                  value: gender,
                  child: Text(gender.name.toUpperCase()),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedGender = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Age
            TextFormField(
              controller: _ageController,
              decoration: const InputDecoration(
                labelText: 'Age *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.calendar_today),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter age';
                }
                final age = int.tryParse(value);
                if (age == null || age < 1 || age > 150) {
                  return 'Please enter a valid age';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Nationality
            TextFormField(
              controller: _nationalityController,
              decoration: const InputDecoration(
                labelText: 'Nationality *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.flag),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter nationality';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Identification Section
            _buildSectionHeader('Identification'),
            const SizedBox(height: 16),

            // National ID
            TextFormField(
              controller: _nationalIdController,
              decoration: const InputDecoration(
                labelText: 'National ID *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.badge),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter national ID';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Passport Number
            TextFormField(
              controller: _passportController,
              decoration: const InputDecoration(
                labelText: 'Passport Number',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.book),
              ),
            ),
            const SizedBox(height: 24),

            // Contact Section
            _buildSectionHeader('Contact Information'),
            const SizedBox(height: 16),

            // Phone Number
            TextFormField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter phone number';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Special Needs Section
            _buildSectionHeader('Special Needs'),
            const SizedBox(height: 16),

            SwitchListTile(
              title: const Text('Has Special Needs'),
              value: _hasSpecialNeeds,
              onChanged: (value) {
                setState(() {
                  _hasSpecialNeeds = value;
                  if (!value) {
                    _specialNeedsType = null;
                    _specialNeedsNotesController.clear();
                  }
                });
              },
            ),

            if (_hasSpecialNeeds) ...[
              const SizedBox(height: 16),
              DropdownButtonFormField<SpecialNeedsType>(
                value: _specialNeedsType,
                decoration: const InputDecoration(
                  labelText: 'Special Needs Type',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.accessible),
                ),
                items: SpecialNeedsType.values.map((type) {
                  return DropdownMenuItem(
                    value: type,
                    child: Text(_formatEnumName(type.name)),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _specialNeedsType = value);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _specialNeedsNotesController,
                decoration: const InputDecoration(
                  labelText: 'Special Needs Notes',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.notes),
                ),
                maxLines: 3,
              ),
            ],
            const SizedBox(height: 24),

            // Status Section
            _buildSectionHeader('Status'),
            const SizedBox(height: 16),

            DropdownButtonFormField<PilgrimStatus>(
              value: _selectedStatus,
              decoration: const InputDecoration(
                labelText: 'Status *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.info),
              ),
              items: PilgrimStatus.values.map((status) {
                return DropdownMenuItem(
                  value: status,
                  child: Text(_formatEnumName(status.name)),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedStatus = value);
                }
              },
            ),
            const SizedBox(height: 24),

            // Notes Section
            _buildSectionHeader('Additional Notes'),
            const SizedBox(height: 16),

            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            // Save Button
            ElevatedButton(
              onPressed: _isLoading ? null : _savePilgrim,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      widget.pilgrim == null ? 'Add Pilgrim' : 'Update Pilgrim',
                      style: const TextStyle(fontSize: 16),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).primaryColor,
          ),
    );
  }

  String _formatEnumName(String name) {
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}
