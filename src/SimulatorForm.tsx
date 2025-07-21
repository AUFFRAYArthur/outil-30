@@ .. @@
           />
         </div>
         <div>
+          <label htmlFor="plafondTauxReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
+            <span>Plafond IS au taux réduit (€)</span>
+            <Tooltip text="Montant maximum de bénéfice pouvant bénéficier du taux réduit d'IS. Valeur standard : 42 500 €." />
+          </label>
+          <input
+            type="number"
+            name="plafondTauxReduit"
+            id="plafondTauxReduit"
+            value={inputs.plafondTauxReduit}
+            onChange={onInputChange}
+            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
+            placeholder="Ex: 42500"
+            min="0"
+          />
+        </div>
+        <div>
+          <label htmlFor="tauxISReduit" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
+            <span>Taux d'IS réduit (%)</span>
+            <Tooltip text="Taux d'imposition réduit applicable sur la première tranche de bénéfice. Valeur standard : 15%." />
+          </label>
+          <input
+            type="number"
+            name="tauxISReduit"
+            id="tauxISReduit"
+            value={inputs.tauxISReduit}
+            onChange={onInputChange}
+            className="w-full p-4 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
+            placeholder="Ex: 15"
+            min="0"
+            max="100"
+            step="0.1"
+          />
+        </div>
+        <div>
           <label htmlFor="tauxIS" className="flex items-center space-x-2 text-lg font-medium text-gray-700 mb-3">
-            <span>Taux d'impôt sur les sociétés (IS) (%)</span>
-            <Tooltip text="Taux d'imposition appliqué sur les bénéfices. Le taux normal est de 25%. Saisissez la valeur souhaitée." />
+            <span>Taux d'IS normal (%)</span>
+            <Tooltip text="Taux d'imposition normal appliqué sur les bénéfices au-delà du plafond du taux réduit. Valeur standard : 25%." />
           </label>
           <input
             type="number"