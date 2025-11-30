import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/agency.dart';
import '../service_locator.dart';

class AgencyFormScreen extends StatefulWidget {
  final Agency? agency;

  const AgencyFormScreen({super.key, this.agency});

  @override
  State<AgencyFormScreen> createState() => _AgencyFormScreenState();
}

class _AgencyFormScreenState extends State<AgencyFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  late TextEditingController _nameController;
  late TextEditingController _codeController;
  late TextEditingController _countryController;
  late TextEditingController _maxPilgrimController;
  late TextEditingController _notesController;
  late TextEditingController _managerNameController;
  late TextEditingController _managerEmailController;
  late TextEditingController _managerPhoneController;
  late TextEditingController _managerPasswordController;

  AgencyStatus _selectedStatus = AgencyStatus.Registered;

  @override
  void initState() {
    super.initState();

    _nameController = TextEditingController(text: widget.agency?.name ?? '');
    _codeController = TextEditingController(text: widget.agency?.code ?? '');
    _countryController = TextEditingController(text: widget.agency?.country ?? '');
    _maxPilgrimController = TextEditingController(text: widget.agency?.maxPilgrim.toString() ?? '');
    _notesController = TextEditingController(text: widget.agency?.notes ?? '');
    _managerNameController = TextEditingController(text: widget.agency?.managerName ?? '');
    _managerEmailController = TextEditingController(text: widget.agency?.managerEmail ?? '');
    _managerPhoneController = TextEditingController(text: widget.agency?.managerPhone ?? '');
    _managerPasswordController = TextEditingController();

    if (widget.agency != null) {
      _selectedStatus = widget.agency!.status;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _countryController.dispose();
    _maxPilgrimController.dispose();
    _notesController.dispose();
    _managerNameController.dispose();
    _managerEmailController.dispose();
    _managerPhoneController.dispose();
    _managerPasswordController.dispose();
    super.dispose();
  }

  Future<void> _saveAgency() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'name': _nameController.text.trim(),
        'code': _codeController.text.trim().isEmpty ? null : _codeController.text.trim(),
        'country': _countryController.text.trim(),
        'maxPilgrim': int.parse(_maxPilgrimController.text.trim()),
        'status': _selectedStatus.name,
        'notes': _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
        'managerName': _managerNameController.text.trim().isEmpty ? null : _managerNameController.text.trim(),
        'managerEmail': _managerEmailController.text.trim().isEmpty ? null : _managerEmailController.text.trim(),
        'managerPhone': _managerPhoneController.text.trim().isEmpty ? null : _managerPhoneController.text.trim(),
      };

      if (_managerPasswordController.text.trim().isNotEmpty) {
        data['managerPassword'] = _managerPasswordController.text.trim();
      }

      if (widget.agency == null) {
        await ServiceLocator.agency.addAgency(data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Agency added successfully')),
          );
        }
      } else {
        await ServiceLocator.agency.updateAgency(widget.agency!.id, data);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Agency updated successfully')),
          );
        }
      }

      if (mounted) {
        Navigator.of(context).pop(true);
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
        title: Text(widget.agency == null ? 'Add Agency' : 'Edit Agency'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildSectionHeader('Agency Information'),
            const SizedBox(height: 16),

            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Agency Name *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.business),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter agency name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _codeController,
              decoration: const InputDecoration(
                labelText: 'Agency Code',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.qr_code),
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _countryController,
              decoration: const InputDecoration(
                labelText: 'Country *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.flag),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter country';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _maxPilgrimController,
              decoration: const InputDecoration(
                labelText: 'Maximum Pilgrims *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.people),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter maximum pilgrims';
                }
                final max = int.tryParse(value);
                if (max == null || max < 1) {
                  return 'Please enter a valid number';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            DropdownButtonFormField<AgencyStatus>(
              value: _selectedStatus,
              decoration: const InputDecoration(
                labelText: 'Status *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.info),
              ),
              items: AgencyStatus.values.map((status) {
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
            const SizedBox(height: 16),

            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 24),

            _buildSectionHeader('Manager Information (Optional)'),
            const SizedBox(height: 16),

            TextFormField(
              controller: _managerNameController,
              decoration: const InputDecoration(
                labelText: 'Manager Name',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _managerEmailController,
              decoration: const InputDecoration(
                labelText: 'Manager Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _managerPhoneController,
              decoration: const InputDecoration(
                labelText: 'Manager Phone',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: _managerPasswordController,
              decoration: InputDecoration(
                labelText: widget.agency == null ? 'Manager Password' : 'Manager Password (leave blank to keep current)',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _isLoading ? null : _saveAgency,
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
                      widget.agency == null ? 'Add Agency' : 'Update Agency',
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
