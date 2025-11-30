import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/hall.dart';
import '../service_locator.dart';
import 'hall_form_screen.dart';

class HallDetailScreen extends StatefulWidget {
  final String hallId;

  const HallDetailScreen({super.key, required this.hallId});

  @override
  State<HallDetailScreen> createState() => _HallDetailScreenState();
}

class _HallDetailScreenState extends State<HallDetailScreen> {
  Hall? _hall;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadHall();
  }

  Future<void> _loadHall() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final hall = await ServiceLocator.hall.getHallById(widget.hallId);

      if (mounted) {
        setState(() {
          _hall = hall;
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

  Future<void> _deleteHall() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Hall'),
        content: Text('Are you sure you want to delete ${_hall?.name}?'),
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
      await ServiceLocator.hall.deleteHall(widget.hallId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Hall deleted successfully')),
        );
        Navigator.of(context).pop(true); // Return true to indicate data changed
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error deleting hall: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _editHall() async {
    if (_hall == null) return;

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => HallFormScreen(hall: _hall),
      ),
    );

    if (result == true) {
      _loadHall(); // Reload to show updated data
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hall Details'),
        actions: [
          if (_hall != null) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: _editHall,
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _deleteHall,
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
              onPressed: _loadHall,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_hall == null) {
      return const Center(child: Text('Hall not found'));
    }

    final hall = _hall!;
    final occupancyRate = ((hall.currentOccupancy / hall.capacity) * 100).toStringAsFixed(1);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: hall.type == HallType.male ? Colors.blue : Colors.pink,
                  child: Icon(
                    hall.type == HallType.male ? Icons.man : Icons.woman,
                    size: 50,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  hall.name,
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Code: ${hall.code}',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Capacity Overview
        _buildSectionCard(
          'Capacity Overview',
          [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatColumn('Total', hall.capacity.toString(), Icons.airline_seat_flat),
                _buildStatColumn('Occupied', hall.currentOccupancy.toString(), Icons.person),
                _buildStatColumn('Available', hall.availableBeds.toString(), Icons.check_circle, color: Colors.green),
              ],
            ),
            const SizedBox(height: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Occupancy Rate'),
                    Text(
                      '$occupancyRate%',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: hall.currentOccupancy / hall.capacity,
                  backgroundColor: Colors.grey[200],
                  color: _getOccupancyColor(hall.currentOccupancy / hall.capacity),
                  minHeight: 10,
                ),
              ],
            ),
            if (hall.specialNeedsOccupancy > 0) ...[
              const SizedBox(height: 16),
              _buildInfoRow(
                Icons.accessible,
                'Special Needs Occupancy',
                hall.specialNeedsOccupancy.toString(),
              ),
            ],
          ],
        ),

        // Hall Information
        _buildSectionCard(
          'Hall Information',
          [
            _buildInfoRow(Icons.qr_code, 'Code', hall.code),
            _buildInfoRow(
              Icons.wc,
              'Type',
              hall.type.name.toUpperCase(),
            ),
            _buildInfoRow(Icons.airline_seat_flat, 'Total Beds', hall.capacity.toString()),
          ],
        ),

        // Beds Grid Preview
        _buildSectionCard(
          'Beds (${hall.beds.length})',
          [
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                childAspectRatio: 1,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: hall.beds.length > 50 ? 50 : hall.beds.length,
              itemBuilder: (context, index) {
                final bed = hall.beds[index];
                return _buildBedTile(bed);
              },
            ),
            if (hall.beds.length > 50)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Showing first 50 of ${hall.beds.length} beds',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              ),
          ],
        ),

        // Timestamps
        _buildSectionCard(
          'System Information',
          [
            _buildInfoRow(
              Icons.calendar_today,
              'Created',
              DateFormat('yyyy-MM-dd HH:mm').format(hall.createdAt),
            ),
            _buildInfoRow(
              Icons.update,
              'Last Updated',
              DateFormat('yyyy-MM-dd HH:mm').format(hall.updatedAt),
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

  Widget _buildBedTile(Bed bed) {
    Color color;
    IconData icon;

    switch (bed.status) {
      case BedStatus.vacant:
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case BedStatus.occupied:
        color = Colors.red;
        icon = Icons.person;
        break;
      case BedStatus.reserved:
        color = Colors.orange;
        icon = Icons.schedule;
        break;
      case BedStatus.maintenance:
        color = Colors.grey;
        icon = Icons.build;
        break;
    }

    return Tooltip(
      message: 'Bed ${bed.id}\n${bed.status.name}',
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          border: Border.all(color: color, width: 2),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Icon(icon, color: color, size: 20),
        ),
      ),
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

  Color _getOccupancyColor(double rate) {
    if (rate < 0.5) {
      return Colors.green;
    } else if (rate < 0.8) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }
}
