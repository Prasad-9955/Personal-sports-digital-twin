import 'package:flutter_test/flutter_test.dart';
import 'package:personal_sports_digital_twin/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SportsTwinApp());
    expect(find.byType(SportsTwinApp), findsOneWidget);
  });
}
