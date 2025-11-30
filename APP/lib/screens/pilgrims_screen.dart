import 'package:flutter/material.dart';
import '../service_locator.dart';
import '../models/pilgrim.dart';
import 'pilgrim_form_screen.dart';
import 'pilgrim_detail_screen.dart';

class PilgrimsScreen extends StatefulWidget {
  const PilgrimsScreen({super.key});

  @override
  State<PilgrimsScreen> createState() => _PilgrimsScreenState();
}

class _PilgrimsScreenState extends State<PilgrimsScreen> {
  List<Pilgrim> _pilgrims = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _currentPage = 0;
  final int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _loadPilgrims();
  }

  Future<void> _loadPilgrims() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await ServiceLocator.pilgrim.getAllPilgrims(
        page: _currentPage,
        size: _pageSize,
      );

      final List<dynamic> content = response['content'] ?? [];
      final pilgrims = content.map((json) => Pilgrim.fromJson(json)).toList();

      if (mounted) {
        setState(() {
          _pilgrims = pilgrims;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          // Check if it's a 403 error
          if (e.toString().contains('403') || e.toString().toLowerCase().contains('access denied')) {
            _errorMessage = 'Access Denied: You need Admin or Supervisor role to view pilgrims.\n\nPlease login with:\nEmail: admin@wafd.com\nPassword: Admin123!';
          } else {
            _errorMessage = e.toString();
          }
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
                    'Pilgrims',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadPilgrims,
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
              builder: (context) => const PilgrimFormScreen(),
            ),
          );
          
          if (result == true) {
            _loadPilgrims(); // Reload list after adding
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
              onPressed: _loadPilgrims,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_pilgrims.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No pilgrims found',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _pilgrims.length,
      itemBuilder: (context, index) {
        final pilgrim = _pilgrims[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: pilgrim.gender == Gender.male
                  ? Colors.blue
                  : Colors.pink,
              child: Icon(
                pilgrim.gender == Gender.male ? Icons.man : Icons.woman,
                color: Colors.white,
              ),
            ),
            title: Text(
              pilgrim.fullName ?? '${pilgrim.firstName ?? ''} ${pilgrim.lastName ?? ''}'.trim(),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('ID: ${pilgrim.registrationNumber ?? pilgrim.nationalId ?? 'N/A'}'),
                  Text('Nationality: ${pilgrim.nationality ?? 'N/A'}'),
                  Text('Status: ${pilgrim.status?.name ?? 'N/A'}'),
                ],
              ),
            ),
            trailing: Icon(
              _getStatusIcon(pilgrim.status ?? PilgrimStatus.expected),
              color: _getStatusColor(pilgrim.status ?? PilgrimStatus.expected),
            ),
            onTap: () async {
              final result = await Navigator.of(context).push<bool>(
                MaterialPageRoute(
                  builder: (context) => PilgrimDetailScreen(pilgrimId: pilgrim.id),
                ),
              );
              
              if (result == true) {
                _loadPilgrims(); // Reload list after changes
              }
            },
          ),
        );
      },
    );
  }

  IconData _getStatusIcon(PilgrimStatus status) {
    switch (status) {
      case PilgrimStatus.arrived:
        return Icons.check_circle;
      case PilgrimStatus.expected:
        return Icons.schedule;
      case PilgrimStatus.departed:
        return Icons.flight_takeoff;
      case PilgrimStatus.no_show:
        return Icons.cancel;
    }
  }

  Color _getStatusColor(PilgrimStatus status) {
    switch (status) {
      case PilgrimStatus.arrived:
        return Colors.green;
      case PilgrimStatus.expected:
        return Colors.orange;
      case PilgrimStatus.departed:
        return Colors.blue;
      case PilgrimStatus.no_show:
        return Colors.red;
    }
  }
}
