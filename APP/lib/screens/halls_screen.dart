import 'package:flutter/material.dart';
import '../service_locator.dart';
import '../models/hall.dart';
import 'hall_form_screen.dart';
import 'hall_detail_screen.dart';

class HallsScreen extends StatefulWidget {
  const HallsScreen({super.key});

  @override
  State<HallsScreen> createState() => _HallsScreenState();
}

class _HallsScreenState extends State<HallsScreen> {
  List<Hall> _halls = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadHalls();
  }

  Future<void> _loadHalls() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final halls = await ServiceLocator.hall.getAllHalls();

      if (mounted) {
        setState(() {
          _halls = halls;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Halls',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadHalls,
                ),
              ],
            ),
          ),
          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.of(context).push<bool>(
            MaterialPageRoute(
              builder: (context) => const HallFormScreen(),
            ),
          );
          
          if (result == true) {
            _loadHalls(); // Reload list after adding
          }
        },
        child: const Icon(Icons.add),
      ),
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
              onPressed: _loadHalls,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_halls.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No halls found',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _halls.length,
      itemBuilder: (context, index) {
        final hall = _halls[index];
        final occupancyRate =
            (hall.currentOccupancy / hall.capacity * 100).toStringAsFixed(1);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor:
                  hall.type == HallType.male ? Colors.blue : Colors.pink,
              child: Icon(
                hall.type == HallType.male ? Icons.man : Icons.woman,
                color: Colors.white,
              ),
            ),
            title: Text(
              hall.name,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Code: ${hall.code}'),
                  Text('Capacity: ${hall.currentOccupancy}/${hall.capacity}'),
                  const SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: hall.currentOccupancy / hall.capacity,
                    backgroundColor: Colors.grey[200],
                    color: _getOccupancyColor(hall.currentOccupancy / hall.capacity),
                  ),
                  const SizedBox(height: 4),
                  Text('Occupancy: $occupancyRate%'),
                ],
              ),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${hall.availableBeds}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
                const Text(
                  'Available',
                  style: TextStyle(fontSize: 12),
                ),
              ],
            ),
            onTap: () async {
              final result = await Navigator.of(context).push<bool>(
                MaterialPageRoute(
                  builder: (context) => HallDetailScreen(hallId: hall.id),
                ),
              );
              
              if (result == true) {
                _loadHalls(); // Reload list after changes
              }
            },
          ),
        );
      },
    );
  }

  Color _getOccupancyColor(double rate) {
    if (rate >= 0.9) return Colors.red;
    if (rate >= 0.7) return Colors.orange;
    return Colors.green;
  }
}
