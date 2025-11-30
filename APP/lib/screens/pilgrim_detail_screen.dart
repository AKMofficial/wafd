import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/pilgrim.dart';
import '../service_locator.dart';
import 'pilgrim_form_screen.dart';

class PilgrimDetailScreen extends StatefulWidget {
  final int pilgrimId;

  const PilgrimDetailScreen({super.key, required this.pilgrimId});

  @override
  State<PilgrimDetailScreen> createState() => _PilgrimDetailScreenState();
}

class _PilgrimDetailScreenState extends State<PilgrimDetailScreen> {
  Pilgrim? _pilgrim;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadPilgrim();
  }

  Future<void> _loadPilgrim() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final pilgrim = await ServiceLocator.pilgrim.getPilgrimById(widget.pilgrimId);

      if (mounted) {
        setState(() {
          _pilgrim = pilgrim;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _deletePilgrim() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Pilgrim'),
        content: Text('Are you sure you want to delete ${_pilgrim?.fullName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await ServiceLocator.pilgrim.deletePilgrim(widget.pilgrimId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pilgrim deleted successfully')),
        );
        Navigator.of(context).pop(true); // Return true to indicate data changed
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting pilgrim: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _editPilgrim() async {
    if (_pilgrim == null) return;

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => PilgrimFormScreen(pilgrim: _pilgrim),
      ),
    );

    if (result == true) {
      _loadPilgrim(); // Reload to show updated data
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pilgrim Details'),
        actions: [
          if (_pilgrim != null) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: _editPilgrim,
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _deletePilgrim,
            ),
          ],
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Error: $_errorMessage',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadPilgrim,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_pilgrim == null) {
      return const Center(child: Text('Pilgrim not found'));
    }

    final pilgrim = _pilgrim!;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header Card with Avatar
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: pilgrim.gender == Gender.male ? Colors.blue : Colors.pink,
                  child: Icon(
                    pilgrim.gender == Gender.male ? Icons.man : Icons.woman,
                    size: 50,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  pilgrim.fullName ?? '${pilgrim.firstName ?? ''} ${pilgrim.lastName ?? ''}'.trim(),
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                _buildStatusChip(pilgrim.status ?? PilgrimStatus.expected),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Personal Information
        _buildSectionCard(
          'Personal Information',
          [
            _buildInfoRow(Icons.badge, 'Registration Number', pilgrim.registrationNumber ?? pilgrim.nationalId ?? 'N/A'),
            _buildInfoRow(Icons.card_membership, 'National ID', pilgrim.nationalId ?? 'N/A'),
            if (pilgrim.passportNumber != null)
              _buildInfoRow(Icons.book, 'Passport Number', pilgrim.passportNumber!),
            _buildInfoRow(Icons.cake, 'Age', '${pilgrim.age ?? 0} years'),
            _buildInfoRow(Icons.wc, 'Gender', pilgrim.gender?.name.toUpperCase() ?? 'N/A'),
            _buildInfoRow(Icons.flag, 'Nationality', pilgrim.nationality ?? 'N/A'),
          ],
        ),

        // Contact Information
        _buildSectionCard(
          'Contact Information',
          [
            _buildInfoRow(Icons.phone, 'Phone Number', pilgrim.phoneNumber ?? 'N/A'),
            if (pilgrim.emergencyContact != null)
              _buildInfoRow(Icons.contact_emergency, 'Emergency Contact', pilgrim.emergencyContact!),
            if (pilgrim.emergencyPhone != null)
              _buildInfoRow(Icons.phone_in_talk, 'Emergency Phone', pilgrim.emergencyPhone!),
          ],
        ),

        // Special Needs
        if (pilgrim.hasSpecialNeeds) ...[
          _buildSectionCard(
            'Special Needs',
            [
              _buildInfoRow(
                Icons.accessible,
                'Type',
                pilgrim.specialNeedsType != null
                    ? _formatEnumName(pilgrim.specialNeedsType!.name)
                    : 'Not specified',
              ),
              if (pilgrim.specialNeedsNotes != null)
                _buildInfoRow(Icons.notes, 'Notes', pilgrim.specialNeedsNotes!),
            ],
          ),
        ],

        // Travel Dates
        if (pilgrim.arrivalDate != null || pilgrim.departureDate != null) ...[
          _buildSectionCard(
            'Travel Information',
            [
              if (pilgrim.arrivalDate != null)
                _buildInfoRow(
                  Icons.flight_land,
                  'Arrival Date',
                  DateFormat('yyyy-MM-dd').format(pilgrim.arrivalDate!),
                ),
              if (pilgrim.departureDate != null)
                _buildInfoRow(
                  Icons.flight_takeoff,
                  'Departure Date',
                  DateFormat('yyyy-MM-dd').format(pilgrim.departureDate!),
                ),
            ],
          ),
        ],

        // Additional Notes
        if (pilgrim.notes != null) ...[
          _buildSectionCard(
            'Additional Notes',
            [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(pilgrim.notes!),
              ),
            ],
          ),
        ],

        // Timestamps
        _buildSectionCard(
          'System Information',
          [
            if (pilgrim.createdAt != null)
              _buildInfoRow(
                Icons.calendar_today,
                'Created',
                DateFormat('yyyy-MM-dd HH:mm').format(pilgrim.createdAt!),
              ),
            if (pilgrim.updatedAt != null)
              _buildInfoRow(
                Icons.update,
                'Last Updated',
                DateFormat('yyyy-MM-dd HH:mm').format(pilgrim.updatedAt!),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildSectionCard(String title, List<Widget> children) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
            ),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(PilgrimStatus status) {
    Color color;
    IconData icon;

    switch (status) {
      case PilgrimStatus.arrived:
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case PilgrimStatus.expected:
        color = Colors.orange;
        icon = Icons.schedule;
        break;
      case PilgrimStatus.departed:
        color = Colors.blue;
        icon = Icons.flight_takeoff;
        break;
      case PilgrimStatus.no_show:
        color = Colors.red;
        icon = Icons.cancel;
        break;
    }

    return Chip(
      avatar: Icon(icon, color: Colors.white, size: 18),
      label: Text(
        _formatEnumName(status.name),
        style: const TextStyle(color: Colors.white),
      ),
      backgroundColor: color,
    );
  }

  String _formatEnumName(String name) {
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}
