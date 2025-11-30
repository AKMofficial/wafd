import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/agency.dart';
import '../service_locator.dart';
import 'agency_form_screen.dart';

class AgencyDetailScreen extends StatefulWidget {
  final int agencyId;

  const AgencyDetailScreen({super.key, required this.agencyId});

  @override
  State<AgencyDetailScreen> createState() => _AgencyDetailScreenState();
}

class _AgencyDetailScreenState extends State<AgencyDetailScreen> {
  Agency? _agency;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadAgency();
  }

  Future<void> _loadAgency() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final agency = await ServiceLocator.agency.getAgencyById(widget.agencyId);

      if (mounted) {
        setState(() {
          _agency = agency;
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

  Future<void> _deleteAgency() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Agency'),
        content: Text('Are you sure you want to delete ${_agency?.name}?'),
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
      await ServiceLocator.agency.deleteAgency(widget.agencyId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Agency deleted successfully')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting agency: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _editAgency() async {
    if (_agency == null) return;

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => AgencyFormScreen(agency: _agency),
      ),
    );

    if (result == true) {
      _loadAgency();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agency Details'),
        actions: [
          if (_agency != null) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: _editAgency,
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _deleteAgency,
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
              onPressed: _loadAgency,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_agency == null) {
      return const Center(child: Text('Agency not found'));
    }

    final agency = _agency!;
    final utilizationRate = ((agency.utilizationRate) * 100).toStringAsFixed(1);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: _getStatusColor(agency.status),
                  child: const Icon(Icons.business, size: 50, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(
                  agency.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                _buildStatusChip(agency.status),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        _buildSectionCard(
          'Statistics',
          [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatColumn('Max', agency.maxPilgrim.toString(), Icons.people),
                _buildStatColumn('Current', agency.pilgrimsCount.toString(), Icons.person),
                _buildStatColumn('Available', agency.availableCapacity.toString(), Icons.check_circle, color: Colors.green),
              ],
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Utilization Rate'),
                    Text(
                      '$utilizationRate%',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: agency.utilizationRate,
                  backgroundColor: Colors.grey[200],
                  color: _getUtilizationColor(agency.utilizationRate),
                  minHeight: 10,
                ),
              ],
            ),
          ],
        ),

        _buildSectionCard(
          'Agency Information',
          [
            if (agency.code != null) _buildInfoRow(Icons.qr_code, 'Code', agency.code!),
            _buildInfoRow(Icons.flag, 'Country', agency.country),
            _buildInfoRow(Icons.people, 'Max Pilgrims', agency.maxPilgrim.toString()),
            _buildInfoRow(Icons.person_outline, 'Current Pilgrims', agency.pilgrimsCount.toString()),
          ],
        ),

        if (agency.managerName != null || agency.managerEmail != null || agency.managerPhone != null)
          _buildSectionCard(
            'Manager Information',
            [
              if (agency.managerName != null) _buildInfoRow(Icons.person, 'Name', agency.managerName!),
              if (agency.managerEmail != null) _buildInfoRow(Icons.email, 'Email', agency.managerEmail!),
              if (agency.managerPhone != null) _buildInfoRow(Icons.phone, 'Phone', agency.managerPhone!),
            ],
          ),

        if (agency.notes != null)
          _buildSectionCard(
            'Notes',
            [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(agency.notes!),
              ),
            ],
          ),

        _buildSectionCard(
          'System Information',
          [
            _buildInfoRow(
              Icons.calendar_today,
              'Created',
              DateFormat('yyyy-MM-dd HH:mm').format(agency.createdAt),
            ),
            _buildInfoRow(
              Icons.update,
              'Last Updated',
              DateFormat('yyyy-MM-dd HH:mm').format(agency.updatedAt),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatColumn(String label, String value, IconData icon, {Color? color}) {
    return Column(
      children: [
        Icon(icon, size: 32, color: color ?? Colors.grey[700]),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
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

  Widget _buildStatusChip(AgencyStatus status) {
    return Chip(
      avatar: Icon(_getStatusIcon(status), color: Colors.white, size: 18),
      label: Text(
        _formatEnumName(status.name),
        style: const TextStyle(color: Colors.white),
      ),
      backgroundColor: _getStatusColor(status),
    );
  }

  Color _getStatusColor(AgencyStatus status) {
    switch (status) {
      case AgencyStatus.Registered:
        return Colors.blue;
      case AgencyStatus.Arrived:
        return Colors.green;
      case AgencyStatus.Departed:
        return Colors.grey;
      case AgencyStatus.Cancelled:
        return Colors.red;
    }
  }

  IconData _getStatusIcon(AgencyStatus status) {
    switch (status) {
      case AgencyStatus.Registered:
        return Icons.app_registration;
      case AgencyStatus.Arrived:
        return Icons.check_circle;
      case AgencyStatus.Departed:
        return Icons.flight_takeoff;
      case AgencyStatus.Cancelled:
        return Icons.cancel;
    }
  }

  Color _getUtilizationColor(double rate) {
    if (rate < 0.5) {
      return Colors.green;
    } else if (rate < 0.8) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  String _formatEnumName(String name) {
    return name
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}
