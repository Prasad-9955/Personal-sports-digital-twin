import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/app_theme.dart';
import '../../services/session_service.dart';
import '../session/session_detail_screen.dart';

class VideoUploadScreen extends StatefulWidget {
  const VideoUploadScreen({super.key});

  @override
  State<VideoUploadScreen> createState() => _VideoUploadScreenState();
}

class _VideoUploadScreenState extends State<VideoUploadScreen> {
  final SessionService _sessionService = SessionService();

  // Use bytes instead of File — works on Web AND native
  Uint8List? _fileBytes;
  String? _fileName;
  int? _fileSizeBytes;
  bool _isUploading = false;
  String _statusMessage = '';
  String? _errorMessage;

  Future<void> _pickVideo() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['mp4', 'mov', 'avi'],
        withData: true, // ensures bytes are loaded on all platforms including Web
      );

      if (result != null && result.files.single.bytes != null) {
        final file = result.files.single;
        setState(() {
          _fileBytes = file.bytes;
          _fileName = file.name;
          _fileSizeBytes = file.size;
          _errorMessage = null;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to select video: $e';
      });
    }
  }

  Future<void> _uploadAndProcess() async {
    if (_fileBytes == null || _fileName == null) return;

    setState(() {
      _isUploading = true;
      _statusMessage = 'Uploading video to authoritative backend...';
      _errorMessage = null;
    });

    try {
      // Step 1: Upload via bytes (web-safe)
      final session = await _sessionService.uploadVideoBytes(_fileBytes!, _fileName!);

      setState(() {
        _statusMessage = 'Running OpenCV validation & BlazePose landmark extraction...';
      });

      // Step 2: Trigger processing
      final processedSession = await _sessionService.processSession(session.id);

      if (processedSession.processingStatus == 'REJECTED') {
        setState(() {
          _isUploading = false;
          _errorMessage = processedSession.errorMessage ??
              'Video rejected due to insufficient pose quality. Please ensure the athlete is fully visible.';
        });
      } else if (processedSession.processingStatus == 'COMPLETED') {
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => SessionDetailScreen(session: processedSession),
            ),
          );
        }
      } else {
        setState(() {
          _isUploading = false;
          _errorMessage = processedSession.errorMessage ?? 'Video processing encountered an issue.';
        });
      }
    } catch (e) {
      setState(() {
        _isUploading = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasFile = _fileBytes != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyze Movement Video'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Guidelines Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.camera_alt_outlined, color: AppTheme.accentCyan, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Video Recording Guidelines',
                          style: TextStyle(
                            color: AppTheme.textLight,
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildGuideline('Lateral (Sagittal) View', 'Position camera perpendicular to the running track for accurate knee/trunk angles.'),
                    _buildGuideline('Full Body Framing', 'Ensure feet, hips, and shoulders remain in frame throughout the movement cycle.'),
                    _buildGuideline('Duration & Frame Rate', 'Record 3-15 seconds at 30fps or 60fps in good lighting conditions.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Video Picker Area
            InkWell(
              onTap: _isUploading ? null : _pickVideo,
              borderRadius: BorderRadius.circular(20),
              child: Container(
                height: 190,
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: hasFile
                        ? AppTheme.accentCyan
                        : AppTheme.accentCyan.withValues(alpha: 0.3),
                    width: hasFile ? 1.8 : 1.2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: hasFile
                          ? AppTheme.accentCyan.withValues(alpha: 0.15)
                          : Colors.black.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: hasFile
                              ? AppTheme.successGreen.withValues(alpha: 0.15)
                              : AppTheme.accentCyan.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          hasFile ? Icons.check_circle_rounded : Icons.cloud_upload_rounded,
                          size: 32,
                          color: hasFile ? AppTheme.successGreen : AppTheme.accentCyan,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        hasFile ? _fileName! : 'Select Athlete Video to Analyze',
                        style: const TextStyle(
                          color: AppTheme.textLight,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        hasFile
                            ? '${(_fileSizeBytes! / (1024 * 1024)).toStringAsFixed(2)} MB • Ready for Landmark Extraction'
                            : 'Supports MP4, MOV, AVI (Lateral Sagittal View Preferred)',
                        style: TextStyle(
                          color: hasFile ? AppTheme.accentCyan : AppTheme.textDim,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 22),

            // Error Display
            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.dangerRed.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.dangerRed.withValues(alpha: 0.4)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppTheme.dangerRed, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppTheme.dangerRed, fontSize: 13, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Upload Status Progress
            if (_isUploading) ...[
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    const SizedBox(
                      width: 28,
                      height: 28,
                      child: CircularProgressIndicator(
                        color: AppTheme.accentCyan,
                        strokeWidth: 2.8,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      _statusMessage,
                      style: const TextStyle(
                        color: AppTheme.accentCyan,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
            ],

            // Submit Button
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: (!hasFile || _isUploading) ? null : _uploadAndProcess,
                icon: const Icon(Icons.insights_rounded, size: 20),
                label: const Text(
                  'Start Biomechanical Analysis',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGuideline(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: AppTheme.accentCyan, fontWeight: FontWeight.bold)),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12.5, height: 1.3),
                children: [
                  TextSpan(text: '$title: ', style: const TextStyle(color: AppTheme.textLight, fontWeight: FontWeight.w600)),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
