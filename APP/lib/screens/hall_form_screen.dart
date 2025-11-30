import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/hall.dart';
import '../service_locator.dart';

class HallFormScreen extends StatefulWidget {
  final Hall? hall; // null for add, non-null for edit

  const HallFormScreen({super.key, this.hall});

  @override
  State<HallFormScreen> createState() => _HallFormScreenState();
}

class _HallFormScreenState extends State<HallFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Form controllers
  late TextEditingController _nameController;
  late TextEditingController _codeController;
  late TextEditingController _capacityController;
  late TextEditingController _locationController;
  late TextEditingController _descriptionController;

  // Form values
  HallType _selectedType = HallType.male;

  @override
  void initState() {
    super.initState();

    // Initialize controllers with existing data if editing
    _nameController = TextEditingController(text: widget.hall?.name ?? '');
    _codeController = TextEditingController(text: widget.hall?.code ?? '');
    _capacityController = TextEditingController(text: widget.hall?.capacity.toString() ?? '');
    _locationController = TextEditingController();
    _descriptionController = TextEditingController();

    if (widget.hall != null) {
      _selectedType = widget.hall!.type;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _capacityController.dispose();
    _locationController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _saveHall() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'name': _nameController.text.trim(),
        'code': _codeController.text.trim(),
        'type': _selectedType.name,
        'capacity': int.parse(_capacityController.text.trim()),
        'location': _locationController.text.trim().isEmpty ? null : _locationController.text.trim(),
        'description': _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      };

      if (widget.hall == null) {
        // Add new hall
        await ServiceLocator.hall.addHall(data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Hall added successfully')),
          );
        }
      } else {
        // Update existing hall
        await ServiceLocator.hall.updateHall(widget.hall!.id, data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Hall updated successfully')),
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
        title: Text(widget.hall == null ? 'Add Hall' : 'Edit Hall'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Basic Information Section
            _buildSectionHeader('Basic Information'),
            const SizedBox(height: 16),

            // Hall Name
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Hall Name *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.home),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter hall name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Hall Code
            TextFormField(
              controller: _codeController,
              decoration: const InputDecoration(
                labelText: 'Hall Code *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.qr_code),
                helperText: 'Unique identifier for the hall',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter hall code';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Hall Type
            DropdownButtonFormField<HallType>(
              value: _selectedType,
              decoration: const InputDecoration(
                labelText: 'Hall Type *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.wc),
              ),
              items: HallType.values.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Row(
                    children: [
                      Icon(
                        type == HallType.male ? Icons.man : Icons.woman,
                        color: type == HallType.male ? Colors.blue : Colors.pink,
                      ),
                      const SizedBox(width: 8),
                      Text(type.name.toUpperCase()),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedType = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Capacity
            TextFormField(
              controller: _capacityController,
              decoration: const InputDecoration(
                labelText: 'Capacity (Number of Beds) *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.airline_seat_flat),
                helperText: 'Total number of beds in this hall',
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter capacity';
                }
                final capacity = int.tryParse(value);
                if (capacity == null || capacity < 1) {
                  return 'Please enter a valid capacity';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Location Section
            _buildSectionHeader('Location'),
            const SizedBox(height: 16),

            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
                helperText: 'Physical location or address',
              ),
            ),
            const SizedBox(height: 24),

            // Description Section
            _buildSectionHeader('Description'),
            const SizedBox(height: 16),

            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.description),
                helperText: 'Additional notes or description',
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),

            // Info card
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue[700]),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Beds will be automatically created when the hall is saved.',
                        style: TextStyle(color: Colors.blue[700]),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Save Button
            ElevatedButton(
              onPressed: _isLoading ? null : _saveHall,
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
                      widget.hall == null ? 'Add Hall' : 'Update Hall',
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
}
