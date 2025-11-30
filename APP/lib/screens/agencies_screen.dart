import 'package:flutter/material.dart';
import '../models/agency.dart';
import '../service_locator.dart';
import 'agency_form_screen.dart';
import 'agency_detail_screen.dart';

class AgenciesScreen extends StatefulWidget {
  const AgenciesScreen({super.key});

  @override
  State<AgenciesScreen> createState() => _AgenciesScreenState();
}

class _AgenciesScreenState extends State<AgenciesScreen> {
  List<Agency> _agencies = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadAgencies();
  }

  Future<void> _loadAgencies() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final agencies = await ServiceLocator.agency.getAllAgencies();

      if (mounted) {
        setState(() {
          _agencies = agencies;
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
                    'Agencies',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: _loadAgencies,
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
              builder: (context) => const AgencyFormScreen(),
            ),
          );
          
          if (result == true) {
            _loadAgencies();
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
              onPressed: _loadAgencies,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_agencies.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.business_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No agencies found',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _agencies.length,
      itemBuilder: (context, index) {
        final agency = _agencies[index];
        final utilizationRate = ((agency.utilizationRate) * 100).toStringAsFixed(1);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getStatusColor(agency.status),
              child: const Icon(Icons.business, color: Colors.white),
            ),
            title: Text(
              agency.name,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (agency.code != null) Text('Code: ${agency.code}'),
                  Text('Country: ${agency.country}'),
                  Text('Pilgrims: ${agency.pilgrimsCount}/${agency.maxPilgrim}'),
                  const SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: agency.utilizationRate,
                    backgroundColor: Colors.grey[200],
                    color: _getUtilizationColor(agency.utilizationRate),
                  ),
                  const SizedBox(height: 2),
                  Text('Utilization: $utilizationRate%', style: const TextStyle(fontSize: 12)),
                ],
              ),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getStatusIcon(agency.status),
                  color: _getStatusColor(agency.status),
                ),
                const SizedBox(height: 4),
                Text(
                  agency.status.name,
                  style: TextStyle(
                    fontSize: 10,
                    color: _getStatusColor(agency.status),
                  ),
                ),
              ],
            ),
            onTap: () async {
              final result = await Navigator.of(context).push<bool>(
                MaterialPageRoute(
                  builder: (context) => AgencyDetailScreen(agencyId: agency.id),
                ),
              );
              
              if (result == true) {
                _loadAgencies();
              }
            },
          ),
        );
      },
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
}
